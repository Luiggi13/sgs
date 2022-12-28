import { SchwarzValues } from "src/schwarz-values/schwarz-values.schema";

export interface SingleKudosTraceLog {
  core_values: SchwarzValues[];
  createdAt: Date | null;
  date: Date;
  giver: string;
  id: string;
  kudos: number;
  media: string;
  message: string;
  receiver: string;
  superKudos: boolean;
  updatedAt: Date | null;
  url: string;
}
