import { UserConstructor } from './constructors';


export class User implements UserConstructor {
  username: string;
  access: string;
  constructor(username: string, access: string) {
    this.username = username;
    this.access = access;
  }
}
