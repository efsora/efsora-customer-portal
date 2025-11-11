describe('Logout Functionality', () => {
    const testUser = {
        email: 'test@example.com',
        password: 'Test1234',
        name: 'Test User',
    };

    beforeEach(() => {
        // Clear storage before each test
        cy.clearAllCookies();
        cy.clearAllLocalStorage();
        cy.clearAllSessionStorage();
    });

    it('should successfully logout and redirect to login page', () => {
        // Step 1: Register or ensure user exists
        // (In a real scenario, you might have a test user that already exists)
        cy.visit('/register');

        // Fill registration form
        cy.get('input[name="email"]').clear().type(testUser.email);
        cy.get('input[name="name"]').clear().type(testUser.name);
        cy.get('input[name="password"]').clear().type(testUser.password);
        cy.get('button[type="submit"]').click();

        // Step 2: Verify successful login/registration (redirect to home)
        cy.url().should('include', '/');
        cy.url().should('not.include', '/register');

        // Step 3: Verify user is authenticated (localStorage should contain auth token)
        cy.window().then((win) => {
            const authStore = win.localStorage.getItem('auth-store');
            expect(authStore).to.exist;
            const parsedStore = JSON.parse(authStore!);
            expect(parsedStore.state.token).to.exist;
            expect(parsedStore.state.user).to.exist;
        });

        // Step 4: Verify logout button is visible in header
        cy.get('button').contains('Logout').should('be.visible');

        // Step 5: Click logout button
        cy.get('button').contains('Logout').click();

        // Step 6: Verify redirect to login page
        cy.url().should('include', '/login');

        // Step 7: Verify auth state is cleared from localStorage
        cy.window().then((win) => {
            const authStore = win.localStorage.getItem('auth-store');
            if (authStore) {
                const parsedStore = JSON.parse(authStore);
                expect(parsedStore.state.token).to.be.null;
                expect(parsedStore.state.user).to.be.null;
            }
        });

        // Step 8: Verify cannot access protected routes
        cy.visit('/');
        cy.url().should('include', '/login');
    });

    it('should handle logout button loading state', () => {
        // Login first
        cy.visit('/login');

        cy.get('input[type="email"]').type(testUser.email);
        cy.get('input[type="password"]').type(testUser.password);
        cy.get('button[type="submit"]').click();

        // Wait for redirect to home
        cy.url().should('include', '/');

        // Click logout and check for loading state
        cy.get('button').contains('Logout').click();
        cy.get('button').contains('Logging out...').should('exist');
    });

    it('should clear auth state even if backend logout fails', () => {
        // Intercept logout endpoint to simulate failure
        cy.intercept('POST', '**/api/v1/auth/logout', {
            statusCode: 500,
            body: {
                success: false,
                message: 'Server error',
            },
        }).as('logoutFail');

        // Login first
        cy.visit('/login');
        cy.get('input[type="email"]').type(testUser.email);
        cy.get('input[type="password"]').type(testUser.password);
        cy.get('button[type="submit"]').click();

        // Wait for redirect
        cy.url().should('include', '/');

        // Click logout
        cy.get('button').contains('Logout').click();

        // Wait for API call
        cy.wait('@logoutFail');

        // Should still redirect and clear auth (graceful degradation)
        cy.url().should('include', '/login');

        cy.window().then((win) => {
            const authStore = win.localStorage.getItem('auth-store');
            if (authStore) {
                const parsedStore = JSON.parse(authStore);
                expect(parsedStore.state.token).to.be.null;
            }
        });
    });

    it('should not show logout button when not authenticated', () => {
        // Visit home page without authentication
        cy.visit('/login');

        // Verify logout button does not exist
        cy.get('button').contains('Logout').should('not.exist');
    });

    it('should prevent access to protected routes after logout', () => {
        // Login first
        cy.visit('/login');
        cy.get('input[type="email"]').type(testUser.email);
        cy.get('input[type="password"]').type(testUser.password);
        cy.get('button[type="submit"]').click();

        // Verify access to protected route
        cy.visit('/users');
        cy.url().should('include', '/users');

        // Logout
        cy.visit('/');
        cy.get('button').contains('Logout').click();

        // Try to access protected route
        cy.visit('/users');

        // Should redirect to login
        cy.url().should('include', '/login');
    });

    it('should successfully call backend logout endpoint', () => {
        // Intercept logout endpoint
        cy.intercept('POST', '**/api/v1/auth/logout').as('logoutRequest');

        // Login first
        cy.visit('/login');
        cy.get('input[type="email"]').type(testUser.email);
        cy.get('input[type="password"]').type(testUser.password);
        cy.get('button[type="submit"]').click();

        // Wait for home page
        cy.url().should('include', '/');

        // Click logout
        cy.get('button').contains('Logout').click();

        // Verify API call was made
        cy.wait('@logoutRequest').its('response.statusCode').should('eq', 200);

        // Verify response structure
        cy.wait('@logoutRequest').then((interception) => {
            expect(interception.response?.body).to.have.property('success', true);
            expect(interception.response?.body).to.have.property('data');
            expect(interception.response?.body.data).to.have.property('message');
        });
    });
});
