/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import mockStore from "../__mocks__/store"
import { localStorageMock } from "../__mocks__/localStorage.js"

import router from "../app/Router.js";

jest.mock("../app/Store.js", () => mockStore)

let newBill = null

beforeEach(() => {
  const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname })
  }
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee',
    email: 'aa@aa.com'
  }))
  document.body.innerHTML = NewBillUI()
  newBill = new NewBill({
    document, onNavigate: onNavigate, store: null, localStorage: window.localStorage
  })
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("When I change file", () => {
      test("Then add file to formData", () => {
      })
      test("Then throw error", () => {
      })
    })
    describe("When I submit form", () => {
      test("Then I'm redirect to bills dashboard", () => {
        userEvent.click(getByRole(document.body, 'button'))
        expect
      })
    })
  })
})
