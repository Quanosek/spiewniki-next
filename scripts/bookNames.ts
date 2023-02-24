export default function BookNames(shortName: string | string[]) {
  let fullName = "";

  switch (shortName) {
    case "all":
      fullName = "Wszystkie śpiewniki";
      break;
    case "PBT":
      fullName = "Pieśni Brzasku Tysiąclecia";
      break;
    case "UP":
      fullName = "Uwielbiajmy Pana (Cegiełki)";
      break;
    case "N":
      fullName = "Śpiewajcie Panu Pieśń Nową";
      break;
    case "E":
      fullName = "Śpiewniczek Młodzieżowy Epifanii";
      break;
    case "I":
      fullName = "Inne pieśni";
      break;
  }

  return fullName;
}
