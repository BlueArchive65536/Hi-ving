// 몰?루

import { useState, useEffect } from 'react';
import useCartStore from './store';
import { motion, AnimatePresence } from 'framer-motion';
import menuDataFromFile from './menu.json';
import './App.css'

// Type definitions
export type MenuItem = {
  name: string;
  price: number;
  image: string;
};

export type OrderItem = MenuItem & { quantity: number };

export type Menu = {
  [category: string]: MenuItem[];
};

const RESTAURANT_NAME = "무슨무슨 식당";
const TABLE_NUMBER = "X번 테이블";

const viewVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

// transition type에 따른 속성을 다르게 설정해야 합니다.
const motionPageTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
} as const;

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5분

function App() {
  const [view, setView] = useState('welcome');
  const [menuData, setMenuData] = useState<Menu | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { order, addToOrder, updateOrderItemQuantity, clearOrder } = useCartStore();

  useEffect(() => {
    if (view === 'complete') {
      const timer = setTimeout(() => {
        setView('welcome');
        clearOrder();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [view]);

  useEffect(() => {
    const data = menuDataFromFile as Menu;
    setMenuData(data);
    if (data && Object.keys(data).length > 0) {
      setSelectedCategory(Object.keys(data)[0]);
    }
  }, []);

  useEffect(() => {
    if (order.length === 0 && view === 'confirm') {
      setView('menu');
    }
  }, [order, view]);

  // 자동 세션 초기화를 위한 비활성 타이머 설정
  useEffect(() => {
    // 시작 화면에 있거나, 주문이 완료된 직후에는 타이머를 실행하지 않습니다.
    if (view === 'welcome' || view === 'complete') {
      return;
    }

    let inactivityTimer: number;

    const resetSession = () => {
      setView('welcome');
      clearOrder();
    };

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = window.setTimeout(resetSession, INACTIVITY_TIMEOUT);
    };

    const activityEvents: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer(); // 초기 타이머 설정

    return () => {
      clearTimeout(inactivityTimer);
      activityEvents.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [view, clearOrder]);

  const total = order.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const renderWelcome = () => (
    <motion.div
      key="welcome"
      variants={viewVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={motionPageTransition}
      className="bg-white h-screen w-screen font-sans text-black" onClick={() => setView('menu')}
    >
      <header className="flex justify-between items-center p-4 text-4xl bg-gray-100 h-[80px]">
        <h1 className="text-black">{RESTAURANT_NAME}</h1>
        <span className="text-black">{TABLE_NUMBER}</span>
      </header>
      <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)] cursor-pointer">
        <div className="text-center">
          <img src="https://placehold.co/800x450.png" alt="광고" className="mb-24 w-[800px] h-[450px] object-cover" />
          <h1 className="text-7xl !text-black">화면을 눌러 주문하기</h1>
        </div>
      </div>
    </motion.div>
  );

  const renderMenu = () => {
    if (!menuData || !selectedCategory) {
      return (
        <div className="bg-white h-screen w-screen flex justify-center items-center">
          <h1 className="text-4xl !text-black">메뉴를 불러오는 중입니다...</h1>
        </div>
      );
    }

    return (
      <motion.main
        key="menu"
        variants={viewVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={motionPageTransition}
        className="bg-white text-black h-screen w-screen font-sans relative"
      >
      <header className="flex justify-between items-center p-4 text-4xl bg-gray-100 h-[80px]">
        <h1 className="text-black">{RESTAURANT_NAME}</h1>
        <span className="text-black">{TABLE_NUMBER}</span>
      </header>
      <div className="flex h-[calc(100vh-80px)]">
        {/* PDF 디자인에 맞춰 카테고리 사이드바와 메뉴 목록 사이에 구분선을 추가합니다. */}
        <div className="w-1/5 bg-gray-50 p-4 flex flex-col border-r-2 border-gray-200">
          {Object.keys(menuData).map((category) => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`text-3xl p-4 mb-4 rounded ${selectedCategory === category ? 'bg-emerald-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              {category}
            </motion.button>
          ))}
          <motion.button
            onClick={() => setView('confirm')}
            className="mt-auto text-3xl p-4 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            메뉴선택 완료
          </motion.button>
        </div>
        <div className="w-4/5 p-4 overflow-y-auto">
          <div className="grid grid-cols-4 gap-4">
            {menuData[selectedCategory].map(item => (
              <motion.div
                key={item.name}
                onClick={() => addToOrder(item)}
                className="bg-white border border-gray-200 rounded-lg flex flex-col cursor-pointer hover:bg-gray-100 overflow-hidden shadow-sm"
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={motionPageTransition}
              >
                <img src={item.image} alt={item.name} className="w-full h-3/5 object-cover" />
                <div className="p-2 flex flex-col justify-center flex-grow">
                  <p className="text-xl text-center font-semibold text-black">{item.name}</p>
                  <p className="text-lg text-center mt-1 text-gray-600">{item.price > 0 ? `${item.price.toLocaleString()}원` : '\u00A0'}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <AnimatePresence>
          {order.length > 0 && (
            <motion.div
              className="absolute bottom-8 right-8 bg-white border border-gray-200 p-6 rounded-lg w-[400px] shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <h3 className="text-2xl font-bold border-b border-gray-200 pb-2 mb-4 text-black">주문 내역</h3>
              <div className="max-h-48 overflow-y-auto pr-2">
                {order.map(item => (
                  <div key={item.name} className="flex justify-between text-lg mb-2 text-black">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString()}원</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between font-bold text-xl text-black">
                <span>총 금액</span>
                <span>{total.toLocaleString()}원</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </motion.main>
    );
  };

  const renderConfirm = () => (
    <motion.main
      key="confirm"
      variants={viewVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={motionPageTransition}
      className="bg-white text-black h-screen w-screen font-sans"
    >
      <header className="flex justify-between items-center p-4 text-4xl bg-gray-100 h-[80px]">
        <h1 className="text-black">{RESTAURANT_NAME}</h1>
        <span className="text-black">{TABLE_NUMBER}</span>
      </header>
      <div className="flex flex-col h-[calc(100vh-80px)] p-8">
        <div className="flex-grow overflow-y-auto pr-4">
          <div className="grid grid-cols-2 gap-x-16 gap-y-4 text-3xl">
            {order.map(item => (
              <div key={item.name} className="flex justify-between items-center w-full text-2xl text-black">
                <span className="flex-1">{item.name}</span>
                <div className="flex items-center gap-2">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateOrderItemQuantity(item.name, -1)} className="bg-gray-200 hover:bg-gray-300 rounded-md w-10 h-10 text-black text-3xl flex items-center justify-center transition-colors">
                    -
                  </motion.button>
                  <span className="w-12 text-center font-bold">{item.quantity}</span>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateOrderItemQuantity(item.name, 1)} className="bg-gray-200 hover:bg-gray-300 rounded-md w-10 h-10 text-black text-3xl flex items-center justify-center transition-colors">
                    +
                  </motion.button>
                </div>
                <span className="w-40 text-right">
                  {(item.price * item.quantity).toLocaleString()}원
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t-2 border-gray-200 pt-6 mt-6">
          <div className="flex justify-between text-4xl font-bold mb-8 text-black">
            <h2>최종 금액</h2>
            <span>{total.toLocaleString()}원</span>
          </div>
          <motion.button
            onClick={() => setView('payment')}
            className="w-full text-4xl p-6 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            주문 완료하기
          </motion.button>
        </div>
      </div>
    </motion.main>
  );

  const renderPayment = () => (
    <motion.main
      key="payment"
      variants={viewVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={motionPageTransition}
      className="bg-white text-black h-screen w-screen font-sans"
    >
      <header className="flex justify-between items-center p-4 text-4xl bg-gray-100 h-[80px]">
        <h1 className="text-black">{RESTAURANT_NAME}</h1>
        <span className="text-black">{TABLE_NUMBER}</span>
      </header>
      <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)] p-8">
        <div className="bg-gray-50 p-12 rounded-lg shadow-lg text-center w-full max-w-2xl">
          <h2 className="text-5xl font-bold mb-8 text-black">결제하기</h2>
          <div className="flex justify-between text-4xl font-bold mb-12 py-6 border-y-2 border-gray-200 text-black">
            <h3>최종 금액</h3>
            <span>{total.toLocaleString()}원</span>
          </div>
          <p className="text-2xl mb-8 text-black">결제 수단을 선택해주세요.</p>
          <div className="flex gap-8 justify-center">
            <motion.button
              onClick={() => setView('complete')}
              className="w-1/2 text-4xl p-8 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              카드 결제
            </motion.button>
            <motion.button
              onClick={() => setView('complete')}
              className="w-1/2 text-4xl p-8 rounded bg-gray-700 text-white hover:bg-gray-800 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              현금 결제
            </motion.button>
          </div>
        </div>
      </div>
    </motion.main>
  );

  const renderComplete = () => (
    <motion.div
      key="complete"
      variants={viewVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={motionPageTransition}
      className="bg-white text-black h-screen w-screen font-sans flex flex-col justify-center items-center"
    >
      <div className="text-center">
        <h1 className="text-6xl mb-8 !text-black">주문이 완료되었습니다.</h1>
        <p className="text-4xl !text-black">5초 후 처음으로 돌아갑니다.</p>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      {view === 'welcome' && renderWelcome()}
      {view === 'menu' && renderMenu()}
      {view === 'confirm' && renderConfirm()}
      {view === 'payment' && renderPayment()}
      {view === 'complete' && renderComplete()}
    </AnimatePresence>
  );
}

export default App
