export default function bookNames(shortName: string | string[]) {
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
    case "S":
      fullName = "Pieśni Chóru Syloe";
      break;
    case "R":
      fullName = "Różne pieśni";
      break;
  }

  return fullName;
}
