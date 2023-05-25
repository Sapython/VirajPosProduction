import { UserConstructor } from "../../../types/user.structure";


export class User implements UserConstructor {
  username: string;
  access: string;
  constructor(username: string, access: string) {
    this.username = username;
    this.access = access;
  }
}
