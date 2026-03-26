describe('ServicesPage', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5173/login');
    cy.get('input[name="email"]').type('admin@bookbeauty.hu');
    cy.get('input[name="password"]').type('Admin1234!');
    cy.contains('button', /bejelentkezés/i).click();
  });


  it('megjeleníti a szolgáltatások  gombot', () => {
    cy.contains('nav', /szolgáltatások/i).should('be.visible');
  });


  it ('kattintásra betöltődnek a szolgáltatások', () => {
    cy.contains('nav', /szolgáltatások/i).click();
    cy.contains(/fodrászok/i).should('be.visible');
    cy.contains(/kozmetikusok/i).should('be.visible');
    cy.contains(/műkörmösök/i).should('be.visible');
  });
  
});

