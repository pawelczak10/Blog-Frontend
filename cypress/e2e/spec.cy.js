export { };

describe("Application testing", () => {
  it("Login", () => {
    cy.visit("/auth");
    cy.get('[id="email"]').type("test@test.com");
    cy.get('[id="password"]').type("test@test.com");
    cy.get("button[type=submit]").click();
    cy.url().should('not.contain', '/auth')
  });
  it("Post view", () => {
    cy.visit("/auth");
    cy.get('[id="email"]').type("test@test.com");
    cy.get('[id="password"]').type("test@test.com");
    cy.get("button[type=submit]").click();
    cy.url().should('not.contain', '/auth')
    cy.contains("Pawel").click();
  });
  it("Edit post", () => {
    cy.visit("/auth");
    cy.get('[id="email"]').type("test@test.com");
    cy.get('[id="password"]').type("test@test.com");
    cy.get("button[type=submit]").click();
    cy.url().should('not.contain', '/auth')
    cy.contains("Pawel").click();
    cy.contains("EDIT").click();
    cy.get('[id="title"]').clear()
    cy.get('[id="title"]').type("Plac Grunwaldzki test");
    cy.contains("UPDATE PLACE").click();
    cy.contains("Plac Grunwaldzki test").click();
  });
  it("Displaying a place on the map and creating a route", () => {
    cy.visit("/auth");
    cy.get('[id="email"]').type("test@test.com");
    cy.get('[id="password"]').type("test@test.com");
    cy.get("button[type=submit]").click();
    cy.url().should('not.contain', '/auth')
    cy.contains("Pawel").click();
    cy.contains("Show details").click();
    cy.contains("SHOW PLACES").click();
    cy.contains("W Kontakcie").click()
    cy.contains("Export to phone").click()
  });
});
