describe('Reset Password Tests', () => {
    beforeEach(() => {
      // Mock the token in the URL
      cy.visit('/reset-password?token=valid-token');
    });
  
    it('Should show validation errors for invalid password', () => {
      cy.get('input#newPassword').type('123'); // Enter a short password
      cy.contains('Au moins 6 caractères *').should('be.visible'); // Verify minlength error
  
      cy.get('input#newPassword').clear();
      cy.contains('Mot de passe requis *').should('be.visible'); // Verify "required" error
    });
  
    it('Should show an error when passwords do not match', () => {
      cy.get('input#newPassword').type('validpassword');
      cy.get('input#confirmPassword').type('differentpassword');
      cy.contains('Les mots de passe ne correspondent pas *').should('be.visible'); // Verify mismatch error
    });
  
    it('Should successfully reset password with valid data', () => {
      cy.intercept('POST', '/password-reset/reset', { statusCode: 200 }).as('resetPassword');
  
      cy.get('input#newPassword').type('validpassword');
      cy.get('input#confirmPassword').type('validpassword');
      cy.get('button[type="submit"]').click();
  
      cy.wait('@resetPassword').its('response.statusCode').should('eq', 200);
      cy.contains('Mot de passe réinitialisé avec succès !').should('be.visible');
    });
  
    it('Should handle backend error during password reset', () => {
      cy.intercept('POST', '/password-reset/reset', { statusCode: 500 }).as('resetPassword');
  
      cy.get('input#newPassword').type('validpassword');
      cy.get('input#confirmPassword').type('validpassword');
      cy.get('button[type="submit"]').click();
  
      cy.wait('@resetPassword');
      cy.contains('Échec de la réinitialisation du mot de passe.').should('be.visible');
    });
  });
  