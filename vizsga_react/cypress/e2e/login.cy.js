describe('LoginPage', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5173/login');
  });

  it('megjeleníti a bejelentkezés gombot', () => {
    cy.contains('button', /bejelentkezés/i).should('be.visible');
  });

  it('hibaüzenetet mutat rövid jelszó esetén', () => {
    cy.get('input[name="password"]').type('123');
    cy.contains('button', /bejelentkezés/i).click();
    cy.contains(/legalább 8 karakter/i).should('be.visible');
  });

  it('sikeres bejelentkezés után a dashboard töltődik be', () => {
    cy.get('input[name="email"]').type('admin@bookbeauty.hu');
    cy.get('input[name="password"]').type('Admin1234!');
    cy.contains('button', /bejelentkezés/i).click();
    cy.contains(/üdvözöljük, admin/i).should('be.visible');
  });

});