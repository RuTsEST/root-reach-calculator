describe('App E2E', () => {
    it('should pass happy path', () => {
        cy.visit('/');
        cy.get('[data-cy=reach-indicator]').should('have.text', '0/21+')
        cy.get('[data-cy=marquise]').click();
        cy.get('[data-cy=reach-indicator]').should('have.text', '10/21+')
        cy.get('[data-cy=alliance]').click();
        cy.get('[data-cy=reach-indicator]').should('have.text', '13/21+')
        cy.get('[data-cy=cult]').click();
        cy.get('[data-cy=riverfolk]').should('be.disabled')
        cy.get('[data-cy=duchy]').click();
        cy.get('[data-cy=reach-indicator]').should('have.text', '23/21+')
        cy.get('[data-cy=eyrie]').should('be.disabled')
    });
});