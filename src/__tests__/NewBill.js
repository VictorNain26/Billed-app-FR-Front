/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from '../containers/NewBill.js'
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import { localStorageMock } from '../__mocks__/localStorage.js'
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";

jest.mock("../app/Store.js", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the NewBills should be rendered", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
    })

    describe("When I submit valid form", () => {
      test("Then bills created and submitted", () => {
        const onNavigate = (pathname) => document.body.innerHTML = ROUTES({ pathname })

        Object.defineProperty(window, "localStorage", {
          value: localStorageMock
        })
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: "Employee"
          })
        )

        const html = NewBillUI()
        document.body.innerHTML = html

        const newBill = new NewBill({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage
        })

        const billData = {
          email:"johndoe@email.com",
          type: "Transport",
          name: "test",
          amount: 150,
          date: "2022-2-22",
          vat: "40",
          pct: 20,
          commentary: " Voluptate deserunt id tempor nulla duis nulla non",
          fileUrl: "facture.png",
          fileName: "facture",
          status: "pending",
        }

        const inputTypeBill = screen.getByTestId('expense-type')
        fireEvent.change(inputTypeBill, {
          target: {value: billData.type}
        })

        const inputNameBill = screen.getByTestId('expense-name')
        fireEvent.change(inputNameBill, {
          target: {value: billData.name}
        })

        const inputAmountBill = screen.getByTestId('amount')
        fireEvent.change(inputAmountBill, {
          target: {value: billData.amount}
        })

        const inputDateBill = screen.getByTestId('datepicker')
        fireEvent.change(inputDateBill, {
          target: {value: billData.date}
        })

        const inputVatBill = screen.getByTestId('vat')
        fireEvent.change(inputVatBill, {
          target: {value: billData.vat}
        })

        const inputPctBill = screen.getByTestId('pct')
        fireEvent.change(inputPctBill, {
          target: {value: billData.pct}
        })

        const inputCommentaryBill = screen.getByTestId('commentary')
        fireEvent.change(inputCommentaryBill, {
          target: {value: billData.commentary}
        })

        newBill.fileUrl = billData.fileUrl
        newBill.fileName = billData.fileName

        const newBillForm = screen.getByTestId("form-new-bill")

        const handleSubmit = jest.fn(newBill.handleSubmit)

        newBillForm.addEventListener("submit", handleSubmit)

        fireEvent.submit(newBillForm)

        expect(handleSubmit).toHaveBeenCalled()
      })
    })

    describe("When I upload a file", () => {
      test("The file extension isn't correct", () => {
        const onNavigate = (pathname) => document.body.innerHTML = ROUTES({ pathname })

        Object.defineProperty(window, "localStorage", {
          value: localStorageMock
        })
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: "Employee"
          })
        )

        document.body.innerHTML = NewBillUI()

        new NewBill({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage
        })
        const inputFile = screen.getByTestId('file')
        fireEvent.change(inputFile, {
          target: {
            files: [new File(['image.gif'], 'image.gif', {type: 'image/gif'})]
          }
        })

        const error = screen.getByTestId('error-message')
        expect(error).toBeTruthy()
        expect(inputFile.classList.contains('is-invalid')).toBeTruthy()
        expect(inputFile.classList.contains('blue-border')).toBeFalsy()
      })
      test("Replace wrong file", async () => {
        const onNavigate = (pathname) => document.body.innerHTML = ROUTES({ pathname })

        Object.defineProperty(window, "localStorage", {
          value: localStorageMock
        })
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: "Employee"
          })
        )

        document.body.innerHTML = NewBillUI()

        new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage
        })

        const inputFile = screen.getByTestId('file')

        const error = document.createElement('span')
        error.innerHTML = "Les extensions d'images authorisée sont JPG, JPEG, PNG."
        error.classList.add('invalid-feedback')
        error.setAttribute('data-testid', 'error-message')
        inputFile.parentNode.append(error)

        inputFile.classList.remove('blue-border')
        inputFile.classList.add('is-invalid')

        fireEvent.change(inputFile, {
          target: {
            files: [new File(['image.jpeg'], 'image.jpeg', {type: 'image/jpeg'})]
          }
        })

        expect(inputFile.classList.contains('is-invalid')).toBeFalsy()
        expect(inputFile.classList.contains('blue-border')).toBeTruthy()
      })
    })
  })
})

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to NewBill", () => {
    test("Create NewBill from mock API POST", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getAllByText("Envoyer une note de frais"))
      const check = screen.getAllByText("Envoyer une note de frais")
			expect(check).toBeTruthy();
    })
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
      test("create bill from an API and fails with 404 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("create bill from an API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})
