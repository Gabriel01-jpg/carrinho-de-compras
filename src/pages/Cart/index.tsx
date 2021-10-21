import React from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { Container, ProductTable, Total } from './styles';
import { formatPrice } from "../../util/format";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
  subTotal: string;
  priceFormatted: string;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormated = cart.map(products => {
      const newProduct = {...products} as Product
      newProduct.priceFormatted = formatPrice(products.price)
      newProduct.subTotal = formatPrice(products.amount * products.price)

      return newProduct

  })

   const total =
     formatPrice(
       cart.reduce((sumTotal, product) => {
          return sumTotal += product.amount * product.price
       }, 0)
     )

  function handleProductIncrement(product: Product) {
      const productId = product.id
      const amount = product.amount + 1
      updateProductAmount({ productId, amount })
  }

  function handleProductDecrement(product: Product) {
      const productId = product.id
      const amount = product.amount - 1
      updateProductAmount({ productId, amount })
  }

  function handleRemoveProduct(productId: number) {
      removeProduct(productId)
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormated.map(products => {
            return (
              <tr key={products.id} data-testid="product">
                <td>
                  <img src={products.image} alt={products.title} />
                </td>
                <td>
                  <strong>{products.title}</strong>
                  <span>{products.priceFormatted}</span>
                </td>
                <td>
                  <div>
                    <button
                      type="button"
                      data-testid="decrement-product"
                    disabled={products.amount <= 1}
                    onClick={() => handleProductDecrement(products)}
                    >
                      <MdRemoveCircleOutline size={20} />
                    </button>
                    <input
                      type="text"
                      data-testid="product-amount"
                      readOnly
                      value={products.amount}
                    />
                    <button
                      type="button"
                      data-testid="increment-product"
                      onClick={() => handleProductIncrement(products)}
                    >
                      <MdAddCircleOutline size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <strong>{products.subTotal}</strong>
                </td>
                <td>
                  <button
                    type="button"
                    data-testid="remove-product"
                    onClick={() => handleRemoveProduct(products.id)}
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
