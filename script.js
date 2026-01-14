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

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initChristmasTimer();
});

// Инициализация обработчиков событий
function initEventListeners() {
    // Кнопки покупки
    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            selectedPlan = e.currentTarget.dataset.plan;
            const price = e.currentTarget.dataset.price;
            openPurchaseModal(selectedPlan, price);
        });
    });

    // Закрытие модалки
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);

    // Отправка формы
    document.getElementById('submitBtn').addEventListener('click', processPayment);

    // Закрытие по клику вне модалки
    document.getElementById('purchaseModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('purchaseModal')) closeModal();
    });

    // Нажатие Enter в поле username
    document.getElementById('telegramUsername').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            processPayment();
        }
    });
}

// Открытие модалки покупки
function openPurchaseModal(plan, price) {
    selectedPlan = plan;
    
    // Обновляем информацию
    document.getElementById('selectedPlanName').textContent = CONFIG.PLANS[plan].name;
    document.getElementById('selectedPlanPrice').textContent = `${price} ₽`;
    
    // Сбрасываем поле
    document.getElementById('telegramUsername').value = '';
    
    // Показываем модалку
    document.getElementById('purchaseModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Фокус на поле ввода
    setTimeout(() => {
        document.getElementById('telegramUsername').focus();
    }, 300);
}

// Обработка платежа
function processPayment() {
    const username = document.getElementById('telegramUsername').value.trim();
    
    // Валидация
    if (!validateTelegramUsername(username)) {
        showError('Введите корректный Telegram @username (5-32 символа, только английские буквы, цифры и _)');
        return;
    }
    
    // Создаем ссылку для оплаты
    const paymentUrl = createYooMoneyPaymentLink(username);
    
    // Перенаправляем пользователя на оплату
    window.location.href = paymentUrl;
}

// Создание ссылки для оплаты ЮMoney
function createYooMoneyPaymentLink(username) {
    const plan = CONFIG.PLANS[selectedPlan];
    const paymentComment = generatePaymentComment(username);
    
    // Параметры для ЮMoney
    const params = new URLSearchParams({
        receiver: CONFIG.YOOMONEY_WALLET,
        'quickpay-form': 'shop',
        targets: `FelixShop: ${plan.name} статус для @${username}`,
        'paymentType': 'AC',
        sum: plan.price,
        label: paymentComment,
        'successURL': window.location.origin + '/success.html?' + 
                      new URLSearchParams({
                          plan: plan.name,
                          amount: plan.price,
                          username: username,
                          id: paymentComment
                      }).toString(),
        'need-fio': 'false',
        'need-email': 'false',
        'need-phone': 'false',
        'need-address': 'false'
    });
    
    return `https://yoomoney.ru/quickpay/confirm?${params.toString()}`;
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
    
    document.getElementById('timerText').textContent = `${days}д ${hours}ч ${minutes}м`;
}

// Валидация Telegram username
function validateTelegramUsername(username) {
    const regex = /^[a-zA-Z0-9_]{5,32}$/;
    return regex.test(username);
}

// Генерация комментария для платежа
function generatePaymentComment(username) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `FELIX_${selectedPlan.toUpperCase()}_${username}_${random}`;
}

// Показать ошибку
function showError(message) {
    // Создаем уведомление об ошибке
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${message}</span>`;
    
    // Стили для ошибки
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4757;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 15px rgba(255, 71, 87, 0.3);
        max-width: 400px;
    `;
    
    document.body.appendChild(errorDiv);
    
    // Убираем через 5 секунд
    setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

// Закрытие модалки
function closeModal() {
    document.getElementById('purchaseModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Добавляем стили для анимаций ошибок
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

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
