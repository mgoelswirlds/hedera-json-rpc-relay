import 'cypress-wait-until';

describe('Test User Login', function () {
    this.timeout(900000);

    const resetMetamaskConnection = function() {
        cy.disconnectMetamaskWalletFromAllDapps();
        cy.resetMetamaskAccount();

        cy.visit('http://localhost:3000');
        cy.contains('Connect Account').click();
        cy.switchToMetamaskWindow();
        cy.acceptMetamaskAccess().should('be.true');
        cy.switchToCypressWindow();
    };

    it('Connects with Metamask', function() {
        resetMetamaskConnection();

        // check the UI
        cy.get('#showAliasBtn').should('not.be.disabled');
        cy.get('#btnDeployContract').should('not.be.disabled');
        cy.get('#btnReadGreeting').should('not.be.disabled');
        cy.get('#btnUpdateGreeting').should('not.be.disabled');
    });

    it('Deploy contract', function() {
        resetMetamaskConnection();

        // deploy the contract
        cy.get('#btnDeployContract').should('not.be.disabled').click();
        cy.confirmMetamaskTransaction();
        cy.waitUntil(() => cy.get('#btnDeployContract').should('not.be.disabled'));

        // test a view call
        cy.get('#btnReadGreeting').should('not.be.disabled').click();
        cy.waitUntil(() => cy.get('#contractViewMsg').should('have.text', ' Result: initial_msg '));

        // test a update call
        cy.get('#updateGreetingText').type('updated_text');
        cy.get('#btnUpdateGreeting').should('not.be.disabled').click();
        cy.confirmMetamaskTransaction();
        cy.waitUntil(() => cy.get('#contractUpdateMsg').should('have.text', ' Updated text: updated_text '));

        // test the updated msg
        cy.get('#btnReadGreeting').should('not.be.disabled').click();
        cy.waitUntil(() => cy.get('#contractViewMsg').should('have.text', ' Result: updated_text '));
    });

    it('Transfer HTS token', function() {
        resetMetamaskConnection();

        // test the HTS transfer
        cy.get('#htsTokenAddressField').type('0x000000000000000000000000000000000000040e');
        cy.get('#htsReceiverAddressField').type('0x54C51b7637BF6fE9709e1e0EBc8b2Ca6a24b0f0A');
        cy.get('#htsTokenAmountField').type('1000');
        cy.get('#htsTokenTransferBtn').should('not.be.disabled').click();
        cy.confirmMetamaskTransaction();

        cy.waitUntil(() => cy.get('#htsTokenMsg').should('have.text', ' Done '));
    });
});
