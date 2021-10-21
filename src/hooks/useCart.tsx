import {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [ cart, setCart ] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if(storagedCart) {
       return JSON.parse(storagedCart);
     }

    return [];
  });


  const addProduct = async (productId: number) => {
    try {
      let newCart = [...cart]
      const cartAlreadyExist = cart.find(element => element.id === productId)
      const { data: stock} = await api.get(`/stock/${productId}`)
      const product = await api.get(`/products/${productId}`)
      let outOfStock = false;
      if(cartAlreadyExist){
          newCart.forEach(values => {
            if(values.id === productId){
              values.amount < stock.amount ? values.amount += 1 : outOfStock = true;
            }
          })
      } else {
        product.data.amount = 1
        newCart = [...newCart, product.data]
      }
      if(!outOfStock){
        setCart(newCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
      } else {
        toast.error('Quantidade solicitada fora de estoque')
      }

    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
        const removeProduct = [...cart]
        if(cart.find(element => element.id === productId)){
          const newCart = removeProduct.filter((products) => {
            return products.id !== productId
          })
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
          setCart(newCart)
        } else {
          toast.error('Erro na remoção do produto');
        }

      }
      catch {
      toast.error('Erro na remoção do produto');
    }
  };

   const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      let updateCart = [...cart]
      const { data: stock } = await api.get(`/stock/${productId}`)
      let outOfStock = false;
      updateCart.forEach(values => {
        if(values.id === productId){
          values.amount < stock.amount ? values.amount += 1 : outOfStock = true;
        }
      })
      if(!outOfStock){
        setCart(updateCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateCart))
      } else {
        toast.error('Quantidade solicitada fora de estoque')
      }


    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
