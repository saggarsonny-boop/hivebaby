import { headers } from "next/headers";
import EngineLanding from "./components/EngineLanding";

export default function RootPage() {
  const headersList = headers();
  const hostname = headersList.get("host") || "";
  
  let engine = "ud-default";
  
  if (hostname.includes(".ud.hive.baby")) {
    engine = hostname.replace(".ud.hive.baby", "");
  } else if (hostname.includes(".universaldocument.org")) {
    engine = hostname.replace(".universaldocument.org", "");
  }

  return <EngineLanding engine={engine} />;
}
