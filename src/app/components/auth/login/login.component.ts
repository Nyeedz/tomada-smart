import { Component, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from "@angular/forms";
import { Util } from "../../../helpers/util.helper";
import { User } from "../../../models/user.model";

export interface UserLoginInfo {
  unique: string;
  password?: string;
  confirm_password?: string;
}

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  user_info: UserLoginInfo = <UserLoginInfo>{};
  title: string = "Login / Cadastro";
  register: boolean = false;
  user: any;

  loginForm = new FormGroup({
    unique: new FormControl("", [Validators.required]),
    password: new FormControl("", [Validators.required]),
    confirmPassword: new FormControl("", [Validators.required])
  });

  getInputErrorMessage(input_name: string) {
    let err_message: string = "";
    if (this.loginForm.get(input_name).hasError("required")) {
      if (input_name == "unique")
        err_message = "Entre com o e-mail ou telefone.";
      else err_message = "Entre com a senha.";
    }
    if (this.loginForm.get(input_name).hasError("custom")) {
      err_message = this.loginForm.get(input_name).getError("custom");
    }

    return err_message;
  }

  throwInputError(input_name: string, message: string) {
    this.loginForm.get(input_name).setErrors({ custom: message });
  }

  constructor() {}

  ngOnInit() {}

  async onSubmit() {
    let data = {
      unique_key: this.user_info.unique,
      password: this.user_info.password
    };

    this.register === false ? this.login(data) : this.create(data);

    return;
  }

  onTryLogin() {
    this.register = false;
    this.title = "Login / Cadastro";
    let unique = this.user_info.unique;
    this.loginForm.reset({ unique: unique });
    this.loginForm.setErrors(null);
  }

  async login(data: Object) {
    let err;
    [err, this.user] = await Util.to(User.LoginReg(data));
    if (err) {
      if (
        err.message.includes("password") ||
        err.message.includes("Password")
      ) {
        this.throwInputError("password", err.message);
      } else if (err.message === "Não cadastrado") {
        this.title = "Por favor, se cadastre";
        this.register = true;
      } else if (
        err.message.includes("phone") ||
        err.message.includes("email")
      ) {
        this.throwInputError("unique", err.message);
      } else {
        this.throwInputError("unique", err.message);
      }

      return;
    }

    return this.user.to("update");
  }

  async create(data: Object) {
    if (this.user_info.confirm_password != this.user_info.password) {
      this.throwInputError("confirmPassword", "As senhas não coincidem");
      return;
    }

    let err;
    [err, this.user] = await Util.to(User.CreateAccount(data));

    if (err) Util.TE(err);

    return this.user.to("update");
  }
}
