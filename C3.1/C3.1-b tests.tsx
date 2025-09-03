
import { formatCollectiveBargainingAgreement } from "@/utils/helpers/mission";

describe("formatCollectiveBargainingAgreement", () => {
  // prettier-ignore
  it("should return correct values when agreement is provided", () => {
    const CC51 = "Convention Collective 51 (Fehap)";
    const CC66 = "Convention Collective 66";
    const CCPrivateHospitalization2002 = "CC Hospitalisation privée du 18 avril 2002";
    const CenterAgainstCancer = "Centres de lutte contre le cancer";
    const CCU = "Convention Collective CCU";
    const thermalisme = "Convention Collective du Thermalisme";
    const sport = "Convention Collective du sport";
    const redCross = "Convention Collective Croix Rouge Française";
    const publicFunction = "Pas de convention collective (Fonction Publique)";
    const UGECAM = "Convention Collective UGECAM";
    const Others = "Autres";

    expect(formatCollectiveBargainingAgreement("CC51")).toEqual(CC51);
    expect(formatCollectiveBargainingAgreement("CC66")).toEqual(CC66);
    expect(formatCollectiveBargainingAgreement("CCPrivateHospitalization2002")).toEqual(CCPrivateHospitalization2002);
    expect(formatCollectiveBargainingAgreement("CenterAgainstCancer")).toEqual(CenterAgainstCancer);
    expect(formatCollectiveBargainingAgreement("CCU")).toEqual(CCU);
    expect(formatCollectiveBargainingAgreement("thermalisme")).toEqual(thermalisme);
    expect(formatCollectiveBargainingAgreement("sport")).toEqual(sport);
    expect(formatCollectiveBargainingAgreement("redCross")).toEqual(redCross);
    expect(formatCollectiveBargainingAgreement("publicFunction")).toEqual(publicFunction);
    expect(formatCollectiveBargainingAgreement("UGECAM")).toEqual(UGECAM);
    expect(formatCollectiveBargainingAgreement("Others")).toEqual(Others);
  });

  it("should return 'Non renseigné' when agreement is not provided", () => {
    expect(formatCollectiveBargainingAgreement("")).toEqual("Non renseigné");
    expect(formatCollectiveBargainingAgreement(" ")).toEqual("Non renseigné");
    expect(formatCollectiveBargainingAgreement(null as unknown as string)).toEqual("Non renseigné");
  });
});

describe("formatDate", () => {
  it("should return 'À partir du' if only startDate is provided", () => {
    const mission = { startDate: "2021-01-01" };
    const result = helpers.formatDate(mission as Mission);
    expect(result).toBe("À partir du 01/01/2021");
  });

  it("should return 'Du ... au ...' if startDate and endDate are provided", () => {
    const mission = { startDate: "2021-01-01", endDate: "2021-01-02" };
    const result = helpers.formatDate(mission as Mission);
    expect(result).toBe("Du 01/01/2021 au 02/01/2021");
  });

  it("should return 'Non renseigné' if no date is provided", () => {
    const mission = {};
    const result = helpers.formatDate(mission as Mission);
    expect(result).toBe("Non renseigné");
  });
});


describe("formatRemunerationData", () => {
  it("should return 'Rétrocession x/y' if retroPercent is set", () => {
    const mission = { retroPercent: 20 };
    expect(helpers.formatRemunerationData(mission as Mission)).toBe("Rétrocession 80/20");
  });

  it("should return 'Pas de rémunération' if exercise is not 'cession' and type is 'free'", () => {
    const mission = { exercise: "not-cession", remuneration: { type: "free" } };
    expect(helpers.formatRemunerationData(mission as Mission)).toBe("Pas de rémunération");
  });

  it("should return 'Cession' if exercise is 'cession' and type is 'free'", () => {
    const mission = { exercise: "cession", price: { type: "free" } };
    expect(helpers.formatRemunerationData(mission as Mission)).toBe("Cession");
  });

  it("should return only typeFormatted if type is set and amount is not", () => {
    const mission = { remuneration: { type: "all-time" } };
    expect(helpers.formatRemunerationData(mission as Mission)).toBe("Au total");
  });

  it("should return typeFormatted and amountFormatted if type and amount are set", () => {
    // 💡NumberFormat use small non-breaking space (\u202f) for thousand separator and normal non-breaking space before currency (\xa0)
    // Source : https://stackoverflow.com/questions/54242039/intl-numberformat-space-character-does-not-match/64909632#64909632

    const missionWithAnnualSalary = { remuneration: { type: "annual-salary", amount: 50000 } };
    expect(helpers.formatRemunerationData(missionWithAnnualSalary as unknown as Mission)).toBe(
      "50\u202f000,00\xa0€ brut annuel"
    );

    const missionWithMonthlySalary = { remuneration: { type: "mensual-salary", amount: 5000 } };
    expect(helpers.formatRemunerationData(missionWithMonthlySalary as unknown as Mission)).toBe(
      "5\u202f000,00\xa0€ brut mensuel"
    );

    const missionWithMonthlyIndemnity = { remuneration: { type: "mensual-indemnity", amount: 5000 } };
    expect(helpers.formatRemunerationData(missionWithMonthlyIndemnity as unknown as Mission)).toBe(
      "5\u202f000,00\xa0€ par mois"
    );

    const missionWithHourlyRate = { remuneration: { type: "hourly-rate", amount: 50 } };
    expect(helpers.formatRemunerationData(missionWithHourlyRate as unknown as Mission)).toBe("50,00\xa0€ brut horaire");

    const missionWithPerAct = { remuneration: { type: "per-act", amount: 15 } };
    expect(helpers.formatRemunerationData(missionWithPerAct as unknown as Mission)).toBe("15,00\xa0€ brut par acte");
  });

  it("should return 'Selon profil' if type is 'depends-on-profile'", () => {
    const mission = { remuneration: { type: "depends-on-profile" } };
    expect(helpers.formatRemunerationData(mission as Mission)).toBe("Selon profil");
  });

  it("should return 'A négocier' if type is 'to-discuss'", () => {
    const mission = { remuneration: { type: "to-discuss" } };
    expect(helpers.formatRemunerationData(mission as Mission)).toBe("A négocier");
  });

  it("should return 'Non renseigné' by default", () => {
    expect(helpers.formatRemunerationData({} as Mission)).toBe("Non renseigné");
  });
});


describe("formatRemunerationDataForPublicView", () => {
  it("should return 'Cession du cabinet' when exercise is 'cession' and price type is 'free'", () => {
    const mission = { exercise: "cession", price: { type: "free" } };
    const result = formatRemunerationDataForPublicView(mission as Mission);
    expect(result).toEqual({ value: null, type: "Cession du cabinet" });
  });

  it("should return 'Prix de vente à négocier' when exercise is 'cession' and price type is 'to-discuss'", () => {
    const mission = { exercise: "cession", price: { type: "to-discuss" } };
    const result = formatRemunerationDataForPublicView(mission as Mission);
    expect(result).toEqual({ value: null, type: "Prix de vente à négocier" });
  });

  it("should return 'Prix de vente' when exercise is 'cession', price type is 'price' and price amount is 1000", () => {
    const mission = { exercise: "cession", price: { type: "price", amount: 1000 } };
    const result = formatRemunerationDataForPublicView(mission as Mission);
    expect(result).toEqual({ value: "1\u202f000,00\xa0€", type: "Prix de vente" });
  });

  it("should return 'Prix non renseigné' when exercise is 'cession' and price type is 'price' but price amount is undefined", () => {
    const mission = { exercise: "cession", price: { type: "price" } };
    const result = formatRemunerationDataForPublicView(mission as Mission);
    expect(result).toEqual({ value: null, type: "Prix non renseigné" });
  });

  it("should return retroPercent", () => {
    const mission = { retroPercent: 50 };
    const result = formatRemunerationDataForPublicView(mission as Mission);
    expect(result).toEqual({ value: "50%", type: "de rétrocession d'honoraires" });
  });

  it("should return 'Pas de rémunération' when remuneration type is 'free'", () => {
    const mission = { remuneration: { type: "free" } };
    const result = formatRemunerationDataForPublicView(mission as Mission);
    expect(result).toEqual({ value: null, type: "Pas de rémunération" });
  });

  it("should return 'Rémunération selon profil' when remuneration type is 'depends-on-profile'", () => {
    const mission = { remuneration: { type: "depends-on-profile" } };
    const result = formatRemunerationDataForPublicView(mission as Mission);
    expect(result).toEqual({ value: null, type: "Rémunération selon profil" });
  });

  it("should return 'Rémunération non renseignée' by default", () => {
    const result = formatRemunerationDataForPublicView({} as unknown as Mission);
    expect(result).toEqual({ value: null, type: "Rémunération non renseignée" });
  });
});


describe("formatSaleReason.test.ts", () => {
  // prettier-ignore
  it("should return correct values when reason is provided", () => {
    const retirement = formatAdReason("retirement");
    const stopActivity = formatAdReason("stop_activity");
    const retraining = formatAdReason("retraining");
    const professionalChange = formatAdReason("professional_change");
    const relocation = formatAdReason("relocation");
    const other = formatAdReason("other");
    const notSpecified = formatAdReason("not-specified");

    expect(retirement).toEqual("départ à la retraite");
    expect(stopActivity).toEqual("arrêt de l'activité");
    expect(retraining).toEqual("reconversion professionnelle");
    expect(professionalChange).toEqual("changement de statut");
    expect(relocation).toEqual("déménagement");
    expect(other).toEqual("non renseigné");
    expect(notSpecified).toEqual("non renseigné");
  });

  it("should return 'non renseigné' when reason is falsy", () => {
    expect(formatAdReason("")).toEqual("non renseigné");
    expect(formatAdReason(null as unknown as string)).toEqual("non renseigné");
  });
});
