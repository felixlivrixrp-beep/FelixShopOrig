// Конфигурация магазина
const CONFIG = {
    TELEGRAM_BOT_TOKEN: '8470666356:AAHWcLZClwqasPeZwoXbzXDjXMjAkefccVA',
    TELEGRAM_CHAT_ID: '-1003643195141',
    YOOMONEY_WALLET: '4100119450984155',
    
    PLANS: {
        premium: { name: 'Premium', price: 120, badge: '⭐ Premium' },
        vip: { name: 'VIP', price: 240, badge: '👑 VIP' },
        christmas: { name: 'Christmas', price: 450, badge: '🎄 Christmas' }
    }
};

// Глобальные переменные
let selectedPlan = null;
let paymentComment = '';
let currentStep = 1;

// DOM элементы
const buyButtons = document.querySelectorAll('.buy-btn');
const purchaseModal = document.getElementById('purchaseModal');
const successModal = document.getElementById('successModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const nextStepBtn = document.getElementById('nextStepBtn');
const backStepBtn = document.getElementById('backStepBtn');
const goToPaymentBtn = document.getElementById('goToPaymentBtn');
const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
const cancelPaymentBtn = document.getElementById('cancelPaymentBtn');
const closeSuccessModalBtn = document.getElementById('closeSuccessModal');

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initCopyButtons();
    initChristmasTimer();
});

// Инициализация обработчиков событий
function initEventListeners() {
    // Кнопки покупки
    buyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            selectedPlan = e.currentTarget.dataset.plan;
            const price = e.currentTarget.dataset.price;
            openPurchaseModal(selectedPlan, price);
        });
    });

    // Закрытие модалок
    closeModalBtn.addEventListener('click', closeAllModals);
    cancelBtn.addEventListener('click', closeAllModals);
    closeSuccessModalBtn.addEventListener('click', closeSuccessModal);

    // Навигация по шагам
    nextStepBtn.addEventListener('click', goToStep2);
    backStepBtn.addEventListener('click', goToStep1);
    goToPaymentBtn.addEventListener('click', goToStep3);
    confirmPaymentBtn.addEventListener('click', confirmPayment);
    cancelPaymentBtn.addEventListener('click', closeAllModals);

    // Закрытие по клику вне модалки
    purchaseModal.addEventListener('click', (e) => {
        if (e.target === purchaseModal) closeAllModals();
    });
    
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) closeSuccessModal();
    });
}

// Открытие модалки покупки
function openPurchaseModal(plan, price) {
    selectedPlan = plan;
    currentStep = 1;
    
    // Обновляем информацию
    document.getElementById('selectedPlanName').textContent = 
        CONFIG.PLANS[plan].name;
    document.getElementById('selectedPlanPrice').textContent = 
        `${price} ₽`;
    document.getElementById('paymentAmount').textContent = 
        `${price} ₽`;
    
    // Сбрасываем поля
    document.getElementById('telegramUsername').value = '';
    document.getElementById('userEmail').value = '';
    
    // Показываем первый шаг
    document.getElementById('step1').classList.add('active');
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.remove('active');
    
    // Показываем модалку
    purchaseModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Переход к шагу 2
function goToStep2() {
    const username = document.getElementById('telegramUsername').value.trim();
    
    if (!validateTelegramUsername(username)) {
        alert('Введите корректный Telegram @username (только английские буквы, цифры и _)');
        return;
    }
    
    // Генерируем комментарий для платежа
    paymentComment = generatePaymentComment(selectedPlan, username);
    document.getElementById('commentText').textContent = paymentComment;
    document.getElementById('paymentComment').dataset.text = paymentComment;
    
    // Обновляем информацию
    document.getElementById('finalPlanName').textContent = 
        CONFIG.PLANS[selectedPlan].name;
    document.getElementById('finalUsername').textContent = `@${username}`;
    document.getElementById('finalPaymentId').textContent = paymentComment;
    
    // Переходим к шагу 2
    currentStep = 2;
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
}

// Переход к шагу 3 (оплата)
function goToStep3() {
    currentStep = 3;
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.add('active');
    
    // Запускаем таймер оплаты
    startPaymentTimer();
    
    // Открываем страницу оплаты в новом окне
    const plan = CONFIG.PLANS[selectedPlan];
    const username = document.getElementById('telegramUsername').value.trim();
    
    const params = new URLSearchParams({
        receiver: CONFIG.YOOMONEY_WALLET,
        'quickpay-form': 'shop',
        targets: `FelixShop: ${plan.name} для @${username}`,
        'paymentType': 'AC',
        sum: plan.price,
        label: paymentComment,
        'successURL': window.location.href
    });
    
    window.open(`https://yoomoney.ru/quickpay/confirm?${params.toString()}`, '_blank');
}

// Подтверждение оплаты
function confirmPayment() {
    const username = document.getElementById('telegramUsername').value.trim();
    const plan = CONFIG.PLANS[selectedPlan];
    
    // Обновляем сообщение успеха
    document.getElementById('successMessage').innerHTML = `
        Мы получили ваш запрос на выдачу статуса <strong>${plan.name}</strong> 
        для пользователя <strong>@${username}</strong>.
    `;
    
    document.getElementById('successPaymentId').textContent = paymentComment;
    document.getElementById('paymentDate').textContent = 
        new Date().toLocaleDateString('ru-RU');
    
    // Показываем модалку успеха
    purchaseModal.classList.remove('active');
    successModal.classList.add('active');
    
    // Симуляция проверки платежа
    simulatePaymentCheck(username, selectedPlan);
}

// Симуляция проверки платежа
async function simulatePaymentCheck(username, plan) {
    const statusText = document.getElementById('statusText');
    const loader = document.querySelector('.loader');
    
    // Этапы проверки
    setTimeout(() => {
        statusText.textContent = 'Проверяем платеж в ЮMoney...';
    }, 1000);
    
    setTimeout(() => {
        statusText.textContent = 'Подтверждаем транзакцию...';
    }, 3000);
    
    setTimeout(() => {
        statusText.textContent = 'Выдаем статус в Telegram...';
    }, 5000);
    
    setTimeout(() => {
        loader.style.borderTopColor = '#4cd964';
        loader.style.animation = 'none';
        statusText.innerHTML = '<strong style="color: #4cd964;">✓ Статус успешно выдан!</strong>';
        
        // Здесь будет реальная интеграция с Telegram API
        // sendTelegramNotification(username, plan);
    }, 7000);
}

// Таймер Christmas
function initChristmasTimer() {
    updateChristmasTimer();
    setInterval(updateChristmasTimer, 1000);
}

function updateChristmasTimer() {
    const targetDate = new Date('2026-01-21T23:59:59');
    const now = new Date();
    const diff = targetDate - now;
    
    if (diff <= 0) {
        document.getElementById('timerText').textContent = 'Акция завершена';
        return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    document.getElementById('timerText').textContent = 
        `${days}д ${hours}ч ${minutes}м`;
}

// Таймер оплаты
function startPaymentTimer() {
    let timeLeft = 300; // 5 минут
    const timerElement = document.getElementById('paymentTimer');
    
    const timer = setInterval(() => {
        timeLeft--;
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 60) {
            timerElement.style.color = '#ff4757';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert('Время на оплату истекло. Начните процесс заново.');
            closeAllModals();
        }
    }, 1000);
    
    // Сохраняем ID таймера
    purchaseModal.dataset.timerId = timer;
}

// Валидация Telegram username
function validateTelegramUsername(username) {
    const regex = /^[a-zA-Z0-9_]{5,32}$/;
    return regex.test(username);
}

// Генерация комментария для платежа
function generatePaymentComment(plan, username) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `FELIX_${plan.toUpperCase()}_${username}_${random}`;
}

// Копирование текста
function initCopyButtons() {
    document.querySelectorAll('.copy-target').forEach(target => {
        target.addEventListener('click', async () => {
            const text = target.dataset.text;
            
            try {
                await navigator.clipboard.writeText(text);
                target.style.background = '#e6ffe6';
                target.style.borderColor = '#4cd964';
                
                setTimeout(() => {
                    target.style.background = '';
                    target.style.borderColor = '';
                }, 2000);
            } catch (err) {
                console.error('Ошибка копирования:', err);
            }
        });
    });
}

// Закрытие модалок
function closeAllModals() {
    purchaseModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Очищаем таймер
    if (purchaseModal.dataset.timerId) {
        clearInterval(purchaseModal.dataset.timerId);
        delete purchaseModal.dataset.timerId;
    }
}

function closeSuccessModal() {
    successModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Политика возвратов
function showRefundPolicy() {
    alert('Все продажи окончательные. Возврат средств не предусмотрен.');
}

// Плавная прокрутка для якорей
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.getAttribute('href') === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});
