import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import type { DeliveryOutput } from "@/lib/api"

import { DeliveryCard } from "./delivery-card"

const delivery: DeliveryOutput = {
  id: "delivery-1",
  memberId: "user-1",
  gcId: "gc-1",
  type: "BASKET",
  quantity: 3500,
  photoUrl: null,
  notes: "Entrega da semana",
  deliveredAt: "2026-11-18T10:00:00.000Z",
  createdAt: "2026-11-18T10:00:00.000Z",
  gc: {
    id: "gc-1",
    name: "GC Águia",
    tribe: "hope",
    avatar: null,
    basketGoal: 7000,
    clothesGoal: 10,
  },
}

describe("DeliveryCard", () => {
  it("renders the basket value and notes", () => {
    render(
      <DeliveryCard
        delivery={delivery}
        canEdit={false}
        canDelete={false}
        isAdmin={false}
        userTribe="hope"
        onDelete={jest.fn()}
      />,
    )

    expect(screen.getByText(/35,00/)).toBeInTheDocument()
    expect(screen.getByText("Entrega da semana")).toBeInTheDocument()
    expect(screen.getByText(/GC Águia/)).toBeInTheDocument()
  })

  it("shows the delete action only for admins and calls it", async () => {
    const onDelete = jest.fn()
    const user = userEvent.setup()

    render(
      <DeliveryCard
        delivery={delivery}
        canEdit={false}
        canDelete
        isAdmin
        userTribe="hope"
        onDelete={onDelete}
      />,
    )

    await user.click(screen.getByRole("button", { name: "Excluir entrega" }))

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(screen.getByText(/Membro: user-1/)).toBeInTheDocument()
  })

  it("hides edit and delete actions from a normal user", () => {
    render(
      <DeliveryCard
        delivery={delivery}
        canEdit={false}
        canDelete={false}
        isAdmin={false}
        userTribe="hope"
        onDelete={jest.fn()}
      />,
    )

    expect(
      screen.queryByRole("button", { name: "Editar entrega" }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Excluir entrega" }),
    ).not.toBeInTheDocument()
  })
})
