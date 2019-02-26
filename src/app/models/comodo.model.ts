// import { Model } from "browser-model";
import { Model } from "./model";
import { User } from "./user.model";
import * as _ from "underscore";
import { API } from "./../helpers/api.helper";
import { Util } from "./../helpers/util.helper";

export class Comodo extends Model {
  constructor(obj: object) {
    super(obj);
  }

  apiUpdateValues: Array<string> = ["nome"]; //these are the values that will be sent to the API

  id;
  nome;

  static SCHEMA = {
    id: { type: "string", primary: true }, //this means every time you make a new object you must give it a _id
    nome: { type: "string" },
    test: { nome: { type: "string" } },
    users: [{ user: { type: "string" }, permissions: [{ type: "string" }] }]
  };

  Users() {
    return this.belongsToMany(User, "users.user", "id", true);
  }

  to(action) {
    return Util.route("/comodo/" + action + "/" + this.id);
  }

  async saveAPI() {
    return API.save(this, "/v1/comodos/" + this.id);
  }

  async removeAPI() {
    return API.remove(this, "/v1/comodos/" + this.id);
  }

  //Static

  static to(action) {
    return Util.route("/comodo/" + action);
  }

  static async getAllAuthComodos() {
    let err, res;
    [err, res] = await Util.to(Util.get("/v1/comodos"));
    if (err) Util.TE(err.message, true);
    if (!res.success) Util.TE(res.error, true);

    let comodos = [];
    for (let i in res.comodos) {
      let comodo_info = res.comodos[i];
      let comodo = this.resCreate(comodo_info);
      comodos.push(comodo);
    }

    return comodos;
  }

  static resCreate(res_comodo) {
    //create comodo instance from a comodo response
    let comodo = this.findById(res_comodo.id);
    if (comodo) return comodo;
    let comodo_info = res_comodo;
    comodo_info.id = res_comodo.id;

    comodo_info.users = res_comodo.users;

    comodo = this.create(comodo_info);
    return comodo;
  }

  static async CreateAPI(comodoInfo: any) {
    let err, res;
    [err, res] = await Util.to(Util.post("/v1/comodos", comodoInfo));
    if (err) Util.TE(err.message, true);
    if (!res.success) Util.TE(res.error, true);
    let comodo = this.resCreate(res.comodo);
    comodo.emit(["newly-created"], comodoInfo, true);
    return comodo;
  }

  static async getById(id: string) {
    let comodo = this.findById(id);
    if (comodo) return comodo;

    let err, res; //get from API
    [err, res] = await Util.to(Util.get("/v1/comodos/" + id));
    if (err) Util.TE(err.message, true);
    if (!res.success) Util.TE(res.error, true);

    let comodo_info = res.comodo;
    comodo = this.resCreate(res.comodo);
    return comodo;
  }
}
