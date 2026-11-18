import { calcStats, sumStats } from "./utils"

describe("metas stats", () => {
  it("splits baskets and clothes by delivery type", () => {
    const stats = calcStats({
      id: "gc-1",
      name: "GC 1",
      avatar: null,
      tribe: "hope",
      basketGoal: 7000,
      clothesGoal: 10,
      goals: [],
      deliveries: [
        { type: "BASKET", quantity: 3500 },
        { type: "CLOTHES", quantity: 3 },
      ],
    })

    expect(stats).toEqual({
      basketGoal: 7000,
      clothesGoal: 10,
      basketDel: 3500,
      clothesDel: 3,
    })
  })

  it("sums the tribe totals", () => {
    expect(
      sumStats([
        { basketGoal: 3500, clothesGoal: 2, basketDel: 3500, clothesDel: 1 },
        { basketGoal: 7000, clothesGoal: 4, basketDel: 0, clothesDel: 3 },
      ]),
    ).toEqual({
      basketGoal: 10500,
      clothesGoal: 6,
      basketDel: 3500,
      clothesDel: 4,
    })
  })
})
