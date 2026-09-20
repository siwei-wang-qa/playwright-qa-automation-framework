import {ProductsPage} from '../pages/ProductsPage';
import {CartPage} from '../pages/CartPage';
import {CheckoutPage} from '../pages/CheckoutPage';
import {CheckoutOverviewPage} from '../pages/CheckoutOverviewPage';
import {checkoutData} from '../test-data/checkoutData';

type CheckoutFlowPages = {
    productsPage: ProductsPage;
    cartPage: CartPage;
    checkoutPage: CheckoutPage;
    checkoutOverviewPage: CheckoutOverviewPage;
};

export async function completeCheckout({
    productsPage,
    cartPage,
    checkoutPage,
    checkoutOverviewPage
}: CheckoutFlowPages): Promise<void> {

    await productsPage.goto();

    await productsPage.addProductToCart(checkoutData.productName);

    await productsPage.openCart();

    await cartPage.clickCheckout();

    await checkoutPage.fillCustomerInformation(
        checkoutData.customerInfo.firstName,
        checkoutData.customerInfo.lastName,
        checkoutData.customerInfo.postalCode
    );

    await checkoutPage.continueCheckout();

    await checkoutOverviewPage.clickFinish();
}
