import { useState, useEffect } from 'react';
import './App.css'

// Type definitions
type MenuItem = {
  name: string;
  price: number;
  image: string;
};

type OrderItem = MenuItem & { quantity: number };

type Menu = {
  [category: string]: MenuItem[];
};

// Sample menu data
const menuData: Menu = {
  '덮밥': [
    { name: '소고기덮밥', price: 12000, image: 'https://via.placeholder.com/150' }, { name: '돼지고기덮밥', price: 11000, image: 'https://via.placeholder.com/150' },
    { name: '치킨덮밥', price: 10000, image: 'https://via.placeholder.com/150' }, { name: '연어덮밥', price: 13000, image: 'https://via.placeholder.com/150' },
  ],
  '라면': [
    { name: '기본라면', price: 5000, image: 'https://via.placeholder.com/150' }, { name: '치즈라면', price: 6000, image: 'https://via.placeholder.com/150' },
    { name: '해물라면', price: 7000, image: 'https://via.placeholder.com/150' }, { name: '떡만두라면', price: 7000, image: 'https://via.placeholder.com/150' },
  ],
  '김밥': [
    { name: '야채김밥', price: 4000, image: 'https://via.placeholder.com/150' }, { name: '참치김밥', price: 5000, image: 'https://via.placeholder.com/150' },
    { name: '소고기김밥', price: 6000, image: 'https://via.placeholder.com/150' }, { name: '치즈김밥', price: 5000, image: 'https://via.placeholder.com/150' },
  ],
  '찜류': [
    { name: '갈비찜', price: 25000, image: 'https://via.placeholder.com/150' }, { name: '해물찜', price: 30000, image: 'https://via.placeholder.com/150' },
    { name: '아구찜', price: 28000, image: 'https://via.placeholder.com/150' },
  ],
  '직원 호출': [
    { name: '불판갈기', price: 0, image: 'https://via.placeholder.com/150' }, { name: '숯갈기', price: 0, image: 'https://via.placeholder.com/150' },
    { name: '담당개발자 호출', price: 0, image: 'https://via.placeholder.com/150' },
  ],
};

const RESTAURANT_NAME = "무슨무슨 식당";
const TABLE_NUMBER = "X번 테이블";

function App() {
  const [view, setView] = useState('welcome');
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('덮밥');

  useEffect(() => {
    if (view === 'complete') {
      const timer = setTimeout(() => {
        setView('welcome');
        setOrder([]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [view]);

  const addToOrder = (item: MenuItem) => {
    setOrder(currentOrder => {
      const existingItem = currentOrder.find(orderItem => orderItem.name === item.name);
      if (existingItem) {
        return currentOrder.map(orderItem =>
          orderItem.name === item.name
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        );
      }
      return [...currentOrder, { ...item, quantity: 1 }];
    });
  };

  const updateOrderItemQuantity = (itemName: string, change: number) => {
    setOrder(currentOrder => {
      const updatedOrder = currentOrder
        .map(item =>
          item.name === itemName
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter(item => item.quantity > 0);

      if (updatedOrder.length === 0 && view === 'confirm') {
        setView('menu');
      }
      return updatedOrder;
    });
  };

  const total = order.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const renderWelcome = () => (
    <div className="bg-emerald-950 text-white h-screen w-screen font-sans" onClick={() => setView('menu')}>
      <header className="flex justify-between items-center p-4 text-4xl bg-black bg-opacity-20 h-[80px]">
        <h1>{RESTAURANT_NAME}</h1>
        <span>{TABLE_NUMBER}</span>
      </header>
      <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)] cursor-pointer">
        <div className="text-center">
          <h2 className="text-6xl mb-24">광고: 뭐</h2>
          <h1 className="text-7xl">화면을 눌러 주문하기</h1>
        </div>
      </div>
    </div>
  );

  const renderMenu = () => (
    <main className="bg-emerald-950 text-white h-screen w-screen font-sans relative">
      <header className="flex justify-between items-center p-4 text-4xl bg-black bg-opacity-30 h-[80px]">
        <h1>{RESTAURANT_NAME}</h1>
        <span>{TABLE_NUMBER}</span>
      </header>
      <div className="flex h-[calc(100vh-80px)]">
        {/* PDF 디자인에 맞춰 카테고리 사이드바와 메뉴 목록 사이에 구분선을 추가합니다. */}
        <div className="w-1/5 bg-emerald-900 p-4 flex flex-col border-r-2 border-white/20">
          {Object.keys(menuData).map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`text-3xl text-white p-4 mb-4 rounded ${selectedCategory === category ? 'bg-emerald-600' : 'bg-emerald-800 hover:bg-emerald-700'}`}
            >
              {category}
            </button>
          ))}
          <button
            onClick={() => setView('confirm')}
            className="mt-auto text-3xl p-4 rounded bg-gray-200 text-gray-800"
            className="mt-auto text-3xl p-4 rounded bg-emerald-500 text-white"
          >
            메뉴선택 완료
          </button>
        </div>
        <div className="w-4/5 p-4 overflow-y-auto">
          <div className="grid grid-cols-4 gap-4">
            {menuData[selectedCategory].map(item => (
              <div
                key={item.name}
                onClick={() => addToOrder(item)}
                className="bg-emerald-800 rounded-lg flex flex-col cursor-pointer hover:bg-emerald-700 overflow-hidden"
              >
                <img src={item.image} alt={item.name} className="w-full h-3/5 object-cover" />
                <div className="p-2 flex flex-col justify-center flex-grow">
                  <p className="text-xl text-center font-semibold">{item.name}</p>
                  <p className="text-lg text-center mt-1">{item.price > 0 ? `${item.price.toLocaleString()}원` : '\u00A0'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {order.length > 0 && (
          <div className="absolute bottom-8 right-8 bg-black bg-opacity-70 p-6 rounded-lg w-[400px] shadow-lg">
            <h3 className="text-2xl font-bold border-b border-white/30 pb-2 mb-4">주문 내역</h3>
            <div className="max-h-48 overflow-y-auto pr-2">
              {order.map(item => (
                <div key={item.name} className="flex justify-between text-lg mb-2">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{(item.price * item.quantity).toLocaleString()}원</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/30 pt-4 mt-4 flex justify-between font-bold text-xl">
              <span>총 금액</span>
              <span>{total.toLocaleString()}원</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );

  const renderConfirm = () => (
    <main className="bg-emerald-950 text-white h-screen w-screen font-sans">
      <header className="flex justify-between items-center p-4 text-4xl bg-black bg-opacity-30 h-[80px]">
        <h1>{RESTAURANT_NAME}</h1>
        <span>{TABLE_NUMBER}</span>
      </header>
      <div className="flex flex-col h-[calc(100vh-80px)] p-8">
        <div className="flex-grow overflow-y-auto pr-4">
          <div className="grid grid-cols-2 gap-x-16 gap-y-4 text-3xl">
            {order.map(item => (
              <div key={item.name} className="flex justify-between items-center w-full text-2xl">
                <span className="flex-1">{item.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateOrderItemQuantity(item.name, -1)} className="bg-emerald-700 hover:bg-emerald-600 rounded-md w-10 h-10 text-white text-3xl flex items-center justify-center transition-colors">
                    -
                  </button>
                  <span className="w-12 text-center font-bold">{item.quantity}</span>
                  <button onClick={() => updateOrderItemQuantity(item.name, 1)} className="bg-emerald-700 hover:bg-emerald-600 rounded-md w-10 h-10 text-white text-3xl flex items-center justify-center transition-colors">
                    +
                  </button>
                </div>
                <span className="w-40 text-right">
                  {(item.price * item.quantity).toLocaleString()}원
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t-2 border-white pt-6 mt-6">
          <div className="flex justify-between text-4xl font-bold mb-8">
            <h2>최종 금액</h2>
            <span>{total.toLocaleString()}원</span>
          </div>
          <button
            onClick={() => setView('payment')}
            className="w-full text-4xl p-6 rounded bg-emerald-500 text-white"
          >
            주문 완료하기
          </button>
        </div>
      </div>
    </main>
  );

  const renderPayment = () => (
    <main className="bg-emerald-950 text-white h-screen w-screen font-sans">
      <header className="flex justify-between items-center p-4 text-4xl bg-black bg-opacity-30 h-[80px]">
        <h1>{RESTAURANT_NAME}</h1>
        <span>{TABLE_NUMBER}</span>
      </header>
      <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)] p-8">
        <div className="bg-emerald-900 p-12 rounded-lg shadow-lg text-center w-full max-w-2xl">
          <h2 className="text-5xl font-bold mb-8">결제하기</h2>
          <div className="flex justify-between text-4xl font-bold mb-12 py-6 border-y-2 border-white/30">
            <h3>최종 금액</h3>
            <span>{total.toLocaleString()}원</span>
          </div>
          <p className="text-2xl mb-8">결제 수단을 선택해주세요.</p>
          <div className="flex gap-8 justify-center">
            <button
              onClick={() => setView('complete')}
              className="w-1/2 text-4xl p-8 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
            >
              카드 결제
            </button>
            <button
              onClick={() => setView('complete')}
              className="w-1/2 text-4xl p-8 rounded bg-gray-500 text-white hover:bg-gray-600 transition-colors"
            >
              현금 결제
            </button>
          </div>
        </div>
      </div>
    </main>
  );

  const renderComplete = () => (
    <div className="bg-emerald-950 text-white h-screen w-screen font-sans flex flex-col justify-center items-center">
      <div className="text-center">
        <h1 className="text-6xl mb-8">주문이 완료되었습니다.</h1>
        <p className="text-4xl">5초 후 처음으로 돌아갑니다.</p>
      </div>
    </div>
  );

  switch (view) {
    case 'welcome': return renderWelcome();
    case 'menu': return renderMenu();
    case 'confirm': return renderConfirm();
    case 'payment': return renderPayment();
    case 'complete': return renderComplete();
    default: return renderWelcome();
  }
}

export default App
