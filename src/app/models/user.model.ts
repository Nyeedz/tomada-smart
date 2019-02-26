// import { Model } from "browser-model";
import { Model } from "./model";
import * as _ from "underscore";
import { LoginOptions } from "ngx-facebook";
import { Comodo } from "./comodo.model";
import * as jwt_decode from "jwt-decode";

//interfaces
import { LoginInfo } from "./../interfaces/login-info";
import { API } from "../helpers/api.helper";
import { Util } from "../helpers/util.helper";

export class User extends Model {
  constructor(obj: Object) {
    super(obj);
  }

  apiUpdateValues: Array<string> = ["email", "phone", "nome", "sobrenome"]; // esses são os valores que vão ser mandados para a APi

  id;
  nome;
  sobrenome;
  auth;
  token;
  email;
  phone;

  static SCHEMA = {
    id: { type: "string", primary: true },
    nome: { type: "string" },
    sobrenome: { type: "string" },
    email: { type: "string" },
    phone: { type: "string" },
    auth: { type: "boolean" },
    token: { type: "string" }
  };

  set full_name(name: string) {
    if (name) {
      let split = name.split(" ");
      this.nome = split[0];
      if (split[1]) this.sobrenome = split[1];
    } else {
      this.nome = "";
      this.sobrenome = "";
    }
  }

  get full_name() {
    let full_name = "";
    if (this.nome) full_name = `${this.nome}`;
    if (this.sobrenome) full_name = `${this.sobrenome}`;

    return full_name;
  }

  logout() {
    this.remove();
    localStorage.clear();
    Util.route("/home");
    this.emit(["logout"], "logout", true);
  }

  async saveAPI() {
    return API.save(this, "/v1/users");
  }

  Comodos() {
    return this.belongsToMany(Comodo, "users.user", "id");
  }

  to(action) {
    return Util.route(`/user/${action}`);
  }

  parseToken() {
    return jwt_decode(this.token);
  }

  // static methods
  static get fb() {
    // return Util.fb
    return {};
  }

  static Auth() {
    let user: User = <User>this.findOne({ auth: true });

    if (user) {
      let parse = user.parseToken();

      let cur_time_date = new Date();
      let cur_time = cur_time_date.getTime() / 1000;

      if (cur_time >= parse.exp) {
        // pega o tempo de expiração do token de usuários, se for para fazer logout
        user.logout();

        return null;
      }
    }

    return user;
  }

  static Login(info: LoginInfo) {
    let user_info: any = info.user;

    user_info.auth = true;
    user_info.token = info.token;

    let user = <User>User.create(user_info);
    user.emit(["login", "auth"], "login", true);
    return user;
  }

  static async LoginReg(data: Object) {
    let res: any;
    let err;
    [err, res] = await Util.to(Util.post("/v1/users/login", data));

    if (err) Util.TE(err, true);

    if (!res.success) Util.TE(res.error, true);

    var login_info: LoginInfo = {
      token: res.token,
      user: res.user
    };

    let user = this.Login(login_info);
    return user;
  }

  static async CreateAccount(data: Object) {
    let err, res: any;
    [err, res] = await Util.to(Util.post("/v1/users", data));

    if (err) Util.TE(err, true);
    if (!res.success) Util.TE(res.error, true);

    var login_info: LoginInfo = {
      token: res.token,
      user: res.user
    };

    let user = this.Login(login_info);
    return user;
  }

  // static async LoginSocial(service: String){
  //   let err, res;
  //   let login_info: LoginInfo
  //   switch(service){
  //     case 'facebook':
  //       // const scopes = 'public_profile,user_friends,email,pages_show_list';
  //       const scopes = 'public_profile,user_friends,email,user_birthday';
  //       const loginOptions: LoginOptions = {
  //         enable_profile_selector: true,
  //         return_scopes: true,
  //         scope: scopes
  //       };
  //       [err, res] = await Util.to(this.fb.login(loginOptions));
  //
  //       let a_res = res.authResponse;
  //       [err, res] = await Util.to(this.fb.api('/me'+'?fields=id,name,picture,email,birthday,gender,age_range,devices,location,first_name,last_name,website'));
  //       [err ,res] = await Util.to(Util.post('/v1/social-auth/facebook', {auth_response:a_res, user_info:res}));
  //
  //       if(res.success == false){
  //         err = res.error
  //       }
  //       if(err) Util.TE(err, true);
  //       login_info = {
  //         token:res.token,
  //         user:res.user
  //       }
  //
  //       break;
  //     case  'google':
  //       err = 'google login not setup';
  //       break;
  //     default:
  //       err = 'no auth login service selected';
  //       break;
  //   }
  //
  //   let user;
  //   if(!err) user = this.Login(login_info);
  //
  //   if(!user) Util.TE('Error loggin user in', true);
  //   return user
  // }
}
