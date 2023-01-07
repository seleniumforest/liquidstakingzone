import { Registry } from "@cosmjs/proto-signing";
import { defaultRegistryTypes } from "@cosmjs/stargate";

export default { 
    cosmos: new Registry(defaultRegistryTypes)
}