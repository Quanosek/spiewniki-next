export default function hymnBookNames(short: string) {
  switch (short) {
    case "all":
      short = "Wszystkie śpiewniki";
      break;
    case "PBT":
      short = "Pieśni Brzasku Tysiąclecia";
      break;
    case "UP":
      short = "Uwielbiajmy Pana (Cegiełki)";
      break;
    case "N":
      short = "Śpiewajcie Panu Pieśń Nową";
      break;
    case "E":
      short = "Śpiewniczek Młodzieżowy Epifanii";
      break;
    case "I":
      short = "Inne pieśni";
      break;
  }

  return short;
}
