// 몰?루

import { useState, useEffect } from 'react';
import useCartStore from './store';
import { motion, AnimatePresence } from 'framer-motion';
import menuDataFromFile from './menu.json';
import './App.css';

export type MenuItem = {
  name: string;
  price: number;
  image: string;
};

export type OrderItem = MenuItem & { quantity: number };

export type Menu = {
  [category: string]: MenuItem[];
};

const RESTAURANT_NAME = "ㅁ?ㄹ";
const TABLE_NUMBER = "19번 테이블";

const viewVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
}; 

const motionPageTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
} as const;


const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

function App() {
  const [view, setView] = useState('welcome');
  const [menuData, setMenuData] = useState<Menu | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showPaymentOverlay, setShowPaymentOverlay] = useState(false);
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
    resetTimer();

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
      className="bg-white h-screen w-screen font-sans text-black"
    >
      <header className="flex justify-between items-center p-4 text-5xl bg-gray-100 h-[88px]">
        <h1 className="!text-black">{RESTAURANT_NAME}</h1>
        <span className="!text-black">{TABLE_NUMBER}</span>
      </header>
      <div
        className="relative flex flex-col justify-center items-center h-[calc(100vh-88px)] cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500"
        onClick={() => setView('menu')}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setView('menu')}
        role="button"
        tabIndex={0}
        aria-label="화면을 눌러 주문 시작"
      >
        <img src="https://placehold.co/1920x1080.png" alt="광고" className="absolute inset-0 w-full h-full object-cover" />
        <h1 className="text-8xl !text-black z-10 relative">화면을 눌러 주문하기</h1>
      </div>
    </motion.div>
  );

  const renderMenu = () => {
    if (!menuData || !selectedCategory) {
      return (
        <div className="bg-white h-screen w-screen flex justify-center items-center">
          <h1 className="text-6xl text-black">메뉴를 불러오는 중입니다...</h1>
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
      <header className="flex justify-between items-center p-4 text-6xl bg-gray-100 h-[88px]">
        <h1 className="!text-black">{RESTAURANT_NAME}</h1>
        <span className="text-black">{TABLE_NUMBER}</span>
      </header>
      <div className="flex h-[calc(100vh-88px)]">
        <div className="w-1/5 bg-gray-50 p-4 flex flex-col border-r-2 border-gray-200">
          {Object.keys(menuData).map((category) => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`text-4xl p-4 mb-4 rounded ${selectedCategory === category ? 'bg-emerald-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              {category}
            </motion.button>
          ))}
          <motion.button
            onClick={() => setView('confirm')}
            className="mt-auto text-4xl p-4 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
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
                  <p className="text-3xl text-center font-semibold text-black">{item.name}</p>
                  <p className="text-xl text-center mt-1 text-gray-600">{item.price > 0 ? `${item.price.toLocaleString()}원` : '\u00A0'}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <AnimatePresence>
          {order.length > 0 && (
            <motion.div
              className="absolute bottom-8 right-8 bg-white border border-gray-200 p-6 rounded-lg w-[440px] shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <h3 className="text-4xl font-bold border-b border-gray-200 pb-2 mb-4 !text-black">주문 내역</h3>
              <div className="max-h-48 overflow-y-auto pr-2">
                {order.map(item => (
                  <div key={item.name} className="flex justify-between text-2xl mb-2 text-black">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="text-right">{(item.price * item.quantity).toLocaleString()}원</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between font-bold text-2xl text-black">
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
      <header className="flex justify-between items-center p-4 text-6xl bg-gray-100 h-[88px]">
        <h1 className="!text-black">{RESTAURANT_NAME}</h1>
        <span className="!text-black">{TABLE_NUMBER}</span>
      </header>
      <div className="flex flex-col h-[calc(100vh-88px)] p-8">
        <div className="flex-grow overflow-y-auto pr-4">
          {order.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-16 gap-y-4 text-5xl">
              {order.map(item => (
                <div key={item.name} className="flex justify-between items-center w-full text-4xl text-black">
                  <span className="flex-1 text-right pr-4">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateOrderItemQuantity(item.name, -1)} className="bg-gray-200 hover:bg-gray-300 rounded-md w-11 h-11 text-black text-5xl flex items-center justify-center transition-colors">
                      -
                    </motion.button>
                    <span className="w-14 text-center font-bold text-4xl">{item.quantity}</span>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateOrderItemQuantity(item.name, 1)} className="bg-gray-200 hover:bg-gray-300 rounded-md w-11 h-11 text-black text-4xl flex items-center justify-center transition-colors">
                      +
                    </motion.button>
                  </div>
                  <span className="w-44 text-right">
                    {(item.price * item.quantity).toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-5xl text-gray-400">주문 내역이 비어있습니다</p>
            </div>
          )}
        </div>
        <div className="border-t-2 border-gray-200 pt-6 mt-6">
          <div className="flex justify-between text-6xl font-bold mb-8 text-black">
            <h2>최종 금액</h2>
            <span>{total.toLocaleString()}원</span>
          </div>
          <div className="flex gap-4">
            <motion.button
              onClick={() => setView('menu')}
              className="w-1/3 text-5xl p-6 rounded bg-gray-300 text-black hover:bg-gray-400 transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              뒤로가기
            </motion.button>
            <motion.button
              onClick={() => setShowPaymentOverlay(true)}
              disabled={order.length === 0}
              className={`w-2/3 text-5xl p-6 rounded transition-colors ${
                order.length > 0
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              whileTap={order.length > 0 ? { scale: 0.98 } : {}}
            >
              주문 완료하기
            </motion.button>
          </div>
        </div>
      </div>
    </motion.main>
  );

  const renderPaymentOverlay = () => (
    <AnimatePresence>
      {showPaymentOverlay && (
        <motion.div
          key="paymentOverlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex justify-center items-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-gray-50 p-12 rounded-lg shadow-lg text-center w-full max-w-2xl"
          >
            <h2 className="text-7xl font-bold mb-8 text-black">결제하기</h2>
            <div className="flex justify-between text-6xl font-bold mb-12 py-6 border-y-2 border-gray-200 text-black">
              <h3>최종 금액</h3>
              <span>{total.toLocaleString()}원</span>
            </div>
            <p className="text-4xl mb-20 text-black">결제 수단을 선택해주세요.</p>
            <p className="text-4xl mb-20 text-black">　</p>
            <div className="flex gap-8 justify-center">
              <motion.button
                onClick={() => { setShowPaymentOverlay(false); setView('complete'); }}
                className="w-1/2 text-4xl p-8 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                카드 결제
              </motion.button>
              <motion.button
                onClick={() => { setShowPaymentOverlay(false); setView('complete'); }}
                className="w-1/2 text-4xl p-8 rounded bg-gray-700 text-white hover:bg-gray-800 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                현금 결제
              </motion.button>
            </div>
            <motion.button
              onClick={() => setShowPaymentOverlay(false)}
              className="mt-8 w-full text-4xl p-6 rounded bg-gray-300 text-black hover:bg-gray-400 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              뒤로가기
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
        <h1 className="text-8xl mb-8 !text-black">주문이 완료되었습니다.</h1>
        <p className="text-6xl text-black">5초 후 처음으로 돌아갑니다.</p>
      </div>
    </motion.div>
  );

  return (
    <>
      <AnimatePresence mode="wait">
        {view === 'welcome' && renderWelcome()}
        {view === 'menu' && renderMenu()}
        {view === 'confirm' && renderConfirm()}
        {view === 'complete' && renderComplete()}
      </AnimatePresence>
      {renderPaymentOverlay()}
    </>
  );
}

export default App    
