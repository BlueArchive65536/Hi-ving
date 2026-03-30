// 몰?루

import { create } from 'zustand';
import type { MenuItem, OrderItem } from './App';

type CartState = {
  order: OrderItem[];
  addToOrder: (item: MenuItem) => void;
  updateOrderItemQuantity: (itemName: string, change: number) => void;
  clearOrder: () => void;
};

const useCartStore = create<CartState>((set) => ({
  order: [],
  addToOrder: (item) =>
    set((state) => {
      const existingItem = state.order.find(
        (orderItem) => orderItem.name === item.name
      );
      if (existingItem) {
        return {
          order: state.order.map((orderItem) =>
            orderItem.name === item.name
              ? { ...orderItem, quantity: orderItem.quantity + 1 }
              : orderItem
          ),
        };
      }
      return { order: [...state.order, { ...item, quantity: 1 }] };
    }),
  updateOrderItemQuantity: (itemName, change) =>
    set((state) => ({
      order: state.order
        .map((item) =>
          item.name === itemName
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0),
    })),
  clearOrder: () => set({ order: [] }),
}));

export default useCartStore;
