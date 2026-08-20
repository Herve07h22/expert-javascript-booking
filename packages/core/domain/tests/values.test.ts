import { it, expect, describe } from "vitest";
import { CalendarDay } from "../values/CalendarDay.js";
import { Stay } from "../values/Stay.js";
import { Occupancy } from "../values/Occupancy.js";

import { day, stay } from "../../tests/helpers.js";

describe("CalendarDay", () => {
  it("n'accepte qu'un jour ISO-8601", () => {
    expect(CalendarDay.parse("2024-06-02").isOk()).toBe(true);
    expect(CalendarDay.parse("02/06/2024").isError()).toBe(true);
    expect(CalendarDay.parse("").isError()).toBe(true);
    expect(CalendarDay.parse(undefined).isError()).toBe(true);
  });

  it("refuse un objet Date : le domaine ne manipule pas d'instants", () => {
    expect(CalendarDay.parse(new Date("2024-06-02")).isError()).toBe(true);
  });

  it("refuse un jour qui n'existe pas", () => {
    expect(CalendarDay.parse("2024-02-31").isError()).toBe(true);
    expect(CalendarDay.parse("2024-13-01").isError()).toBe(true);
    expect(CalendarDay.parse("2024-02-29").isOk()).toBe(true); // année bissextile
  });

  it("se compare sans conversion", () => {
    expect(day("2024-06-02").isBefore(day("2024-06-04"))).toBe(true);
    expect(day("2024-06-04").isBefore(day("2024-06-02"))).toBe(false);
    expect(day("2024-06-02").isBefore(day("2024-06-02"))).toBe(false);
    expect(day("2024-06-02").equals(day("2024-06-02"))).toBe(true);
  });

  it("est immutable", () => {
    const d = day("2024-06-02");
    expect(() => {
      (d as unknown as { iso: string }).iso = "2024-01-01";
    }).toThrow();
    expect(String(d)).toBe("2024-06-02");
  });
});

describe("Stay", () => {
  it("exige au moins une nuitée", () => {
    expect(Stay.parse({ from: "2024-06-02", to: "2024-06-04" }).isOk()).toBe(true);
    expect(Stay.parse({ from: "2024-06-02", to: "2024-06-02" }).isError()).toBe(true);
    expect(Stay.parse({ from: "2024-06-04", to: "2024-06-02" }).isError()).toBe(true);
  });

  it("propage l'erreur d'un jour invalide", () => {
    expect(Stay.parse({ from: "hier", to: "2024-06-04" }).isError()).toBe(true);
  });

  it("compte les nuitées", () => {
    expect(stay("2024-06-02", "2024-06-04").nights).toBe(2);
    // Passage à l'heure d'été : toujours 2 nuitées, pas 1,96
    expect(stay("2024-03-30", "2024-04-01").nights).toBe(2);
  });

  it("sait s'il commence après un jour donné", () => {
    expect(stay("2024-06-02", "2024-06-04").startsAfter(day("2024-06-01"))).toBe(true);
    // Le préavis d'un jour : on ne réserve pas pour le jour même
    expect(stay("2024-06-02", "2024-06-04").startsAfter(day("2024-06-02"))).toBe(false);
    expect(stay("2024-06-02", "2024-06-04").startsAfter(day("2024-06-03"))).toBe(false);
  });

  describe("overlaps", () => {
    const juin2au4 = stay("2024-06-02", "2024-06-04");

    it("autorise la rotation : le départ du 4 ne bloque pas l'arrivée du 4", () => {
      expect(juin2au4.overlaps(stay("2024-06-04", "2024-06-06"))).toBe(false);
      expect(stay("2024-05-30", "2024-06-02").overlaps(juin2au4)).toBe(false);
    });

    it("détecte un chevauchement partiel", () => {
      expect(juin2au4.overlaps(stay("2024-06-03", "2024-06-06"))).toBe(true);
      expect(stay("2024-06-01", "2024-06-03").overlaps(juin2au4)).toBe(true);
    });

    it("détecte l'inclusion", () => {
      expect(stay("2024-06-01", "2024-06-10").overlaps(juin2au4)).toBe(true);
      expect(juin2au4.overlaps(stay("2024-06-01", "2024-06-10"))).toBe(true);
    });

    it("laisse passer deux séjours disjoints", () => {
      expect(juin2au4.overlaps(stay("2024-05-12", "2024-05-15"))).toBe(false);
    });
  });
});

describe("Occupancy", () => {
  it("exige au moins un adulte", () => {
    expect(Occupancy.of({ adults: 2, children: 3 }).isOk()).toBe(true);
    expect(Occupancy.of({ adults: 1 }).isOk()).toBe(true);
    expect(Occupancy.of({ adults: 0, children: 3 }).isError()).toBe(true);
    expect(Occupancy.of({ adults: 1.5 }).isError()).toBe(true);
    expect(Occupancy.of({ adults: 2, children: -1 }).isError()).toBe(true);
  });

  it("compte les occupants", () => {
    expect(Occupancy.of({ adults: 2, children: 3 }).value.total).toBe(5);
    expect(Occupancy.of({ adults: 2 }).value.children).toBe(0);
  });
});
