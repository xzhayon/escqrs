import { FileNotFound } from './FileNotFound'

export class DirectoryNotFound extends FileNotFound {
    constructor(message:string){
        super(message)
        Object.setPrototypeOf(this,DirectoryNotFound.prototype)
    }

    static build(path:string){
        return new DirectoryNotFound(`Cannot find directory "${path}"`)
    }
}
