import type { Field } from "./erd.type";

export type ParsedRelation = {
  fieldName: string;
  type: string;
  relationType: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
  targetEntity: string;
  isNullable: boolean;
};

export type ParsedEntity = {
  name: string;
  fields: Field[];
  relations: ParsedRelation[];
};
