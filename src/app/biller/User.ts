import { UserConstructor } from './constructors';


export class User implements UserConstructor {
  id: string;
  name: string;
  access: string;
  image: string;
  constructor(id: string, name: string, access: string, image: string) {
    this.id = id;
    this.name = name;
    this.access = access;
    this.image = image;
  }
}
