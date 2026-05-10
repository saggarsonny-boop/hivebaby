import { headers } from "next/headers";
import EngineDashboard from "../components/EngineDashboard";

export default function DashboardPage() {
  const headersList = headers();
  const hostname = headersList.get("host") || "";
  
  let engine = "ud-default";
  
  if (hostname.includes(".ud.hive.baby")) {
    engine = hostname.replace(".ud.hive.baby", "");
  } else if (hostname.includes(".universaldocument.org")) {
    engine = hostname.replace(".universaldocument.org", "");
  }

  return <EngineDashboard engine={engine} />;
}
