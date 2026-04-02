document.addEventListener('DOMContentLoaded', () => {
    const addDayButton = document.getElementById('add-day-button');
    const deleteAllButton = document.getElementById('delete-all-button');
    const saveButton = document.getElementById('save-button');
    const loadPlanButton = document.getElementById('load-plan-button');
    const planFileInput = document.getElementById('plan-file-input');
    const modeToggleButton = document.getElementById('mode-toggle-btn');
    const planTypeSelector = document.getElementById('plan-type-selector');
    const daysContainer = document.getElementById('days-container');
    let dayCounter = 0;

    // قائمة الحقول الغذائية المتاحة
    const nutritionFields = {
        calories: { label: 'سعرات', unit: '' },
        protein: { label: 'بروتين', unit: 'جرام' },
        carbs: { label: 'كارب', unit: 'جرام' },
        fats: { label: 'دهون', unit: 'جرام' },
        fiber: { label: 'ألياف', unit: 'جرام' },
        sugar: { label: 'سكريات', unit: 'جرام' }
    };


    /**
     * إنشاء قسم وجبة جديد.
     */
    const createMealBlock = () => {
        const planType = planTypeSelector.value;
        const mealBlock = document.createElement('div');
        mealBlock.className = 'meal-block';

        const title = planType === 'diet' ? 'عنوان الوجبة' : 'اسم التمرين';
        const content = planType === 'diet' ? 'أدخل تفاصيل الوجبة...' : 'أدخل ملاحظات التمرين...';
        let detailsHtml = '';

        if (planType === 'diet') {
            document.querySelectorAll('#nutrition-fields-checkboxes input:checked').forEach(checkbox => {
                const fieldKey = checkbox.dataset.field;
                const field = nutritionFields[fieldKey];
                detailsHtml += `<span data-field="${fieldKey}"><strong>${field.label}:</strong> <span contenteditable="true">0</span> ${field.unit}</span>`;
            });
        } else { // workout
            detailsHtml = `
                <span class="workout-field"><strong>الوزن:</strong> <span contenteditable="true">0</span> كجم</span>
                <span class="workout-field"><strong>العدادات:</strong> <span contenteditable="true">0</span></span>
                <span class="workout-field"><strong>المجاميع:</strong> <span contenteditable="true">0</span></span>
            `;
        }

        mealBlock.innerHTML = `
            <button class="delete-meal-btn" title="حذف الوجبة">🗑️</button>
            <h3 contenteditable="true">${title}</h3>
            <div class="meal-content" contenteditable="true">${content}</div>
            <div class="meal-details">${detailsHtml}</div>
        `;
        return mealBlock;
    };

    /**
     * إنشاء قسم يوم جديد.
     */
    const createDayBlock = () => {
        dayCounter++;
        const dayBlock = document.createElement('div');
        const addBtnText = planTypeSelector.value === 'diet' ? '➕ إضافة وجبة' : '➕ إضافة تمرين';
        dayBlock.className = 'day-block';
        dayBlock.innerHTML = `
            <div class="day-header">
                <h2 contenteditable="true">اليوم ${dayCounter}</h2>
                <div class="day-header-buttons">
                    <button class="add-meal-btn">${addBtnText}</button>
                    <button class="delete-day-btn" title="حذف اليوم">🗑️</button>
                </div>
            </div>
            <div class="meals-container">
                <!-- سيتم إضافة الوجبات هنا -->
            </div>
        `;
        return dayBlock;
    };

    /**
     * إضافة يوم جديد إلى الصفحة.
     */
    const addDay = () => {
        const newDay = createDayBlock();
        daysContainer.appendChild(newDay);
    };

    /**
     * حذف جميع الأيام من الصفحة.
     */
    const deleteAllDays = () => {
        if (confirm('هل أنت متأكد من أنك تريد حذف كل شيء؟ لا يمكن التراجع عن هذا الإجراء.')) {
            daysContainer.innerHTML = '';
            dayCounter = 0; // إعادة تعيين العداد
        }
    };

    /**
     * تبديل الوضع بين النهاري والليلي.
     */
    const toggleMode = () => {
        if (modeToggleButton.dataset.mode === 'dark') {
            modeToggleButton.dataset.mode = 'light';
            modeToggleButton.innerHTML = 'نهاري ☀️';
            document.body.classList.remove('dark-theme');
        } else {
            modeToggleButton.dataset.mode = 'dark';
            modeToggleButton.innerHTML = 'ليلي 🌙';
            document.body.classList.add('dark-theme');
        }
    };

    /**
     * تحديث فئات الـ Body لتطبيق السمات والتنسيقات.
     */
    const updateBodyClasses = () => {
        const theme = document.getElementById('theme-selector').value;
        const mobile = document.getElementById('mobile-layout-selector').value;
        
        // مسح الفئات القديمة المتعلقة بالثيم والتخطيط
        document.body.className = document.body.classList.contains('dark-theme') ? 'dark-theme' : '';
        
        // إضافة الفئات الجديدة
        document.body.classList.add(theme);
        document.body.classList.add(mobile);
        
        if (modeToggleButton.dataset.mode === 'dark') {
            document.body.classList.add('dark-theme');
        }
    };

    /**
     * تحديث واجهة المستخدم بناءً على نوع الخطة المختار.
     */
    const updateUIForPlanType = () => {
        const planType = planTypeSelector.value;
        const mainHeader = document.querySelector('header h1');
        const mainDescription = document.querySelector('header p.description');
        const addDayBtn = document.getElementById('add-day-button');
        const nutritionFieldsContainer = document.getElementById('nutrition-fields-container');

        if (planType === 'workout') {
            mainHeader.textContent = 'جدول النظام التدريبي';
            mainDescription.textContent = 'قم ببناء خطتك التدريبية بإضافة التمارين لكل يوم.';
            addDayBtn.textContent = '➕ إضافة يوم تدريبي';
            nutritionFieldsContainer.style.display = 'none'; // إخفاء حقول التغذية
        } else { // diet
            mainHeader.textContent = 'جدول النظام الغذائي';
            mainDescription.textContent = 'قم ببناء خطتك الغذائية بإضافة الأيام والوجبات بشكل ديناميكي.';
            addDayBtn.textContent = '➕ إضافة يوم';
            nutritionFieldsContainer.style.display = 'block'; // إظهار حقول التغذية
        }

        // تحديث كل العناصر الحالية في الصفحة
        document.querySelectorAll('.day-block').forEach(dayBlock => {
            const addMealBtn = dayBlock.querySelector('.add-meal-btn');
            if (addMealBtn) {
                addMealBtn.textContent = planType === 'diet' ? '➕ إضافة وجبة' : '➕ إضافة تمرين';
            }

            dayBlock.querySelectorAll('.meal-block').forEach(mealBlock => {
                const details = mealBlock.querySelector('.meal-details');
                let newDetailsHtml = '';
                if (planType === 'diet') {
                    // إعادة بناء الحقول بناءً على الاختيارات الحالية
                    document.querySelectorAll('#nutrition-fields-checkboxes input:checked').forEach(checkbox => {
                        const fieldKey = checkbox.dataset.field;
                        const field = nutritionFields[fieldKey];
                        newDetailsHtml += `<span data-field="${fieldKey}"><strong>${field.label}:</strong> <span contenteditable="true">0</span> ${field.unit}</span>`;
                    });
                } else { // workout
                    newDetailsHtml = `
                        <span class="workout-field"><strong>الوزن:</strong> <span contenteditable="true">0</span> كجم</span>
                        <span class="workout-field"><strong>العدادات:</strong> <span contenteditable="true">0</span></span>
                        <span class="workout-field"><strong>المجاميع:</strong> <span contenteditable="true">0</span></span>
                    `;
                }
                details.innerHTML = newDetailsHtml;
            });
        });
    };

    /**
     * يقوم بإنشاء صناديق الاختيار الخاصة بالحقول الغذائية.
 */
    const populateNutritionFields = () => {
        const container = document.getElementById('nutrition-fields-checkboxes');
        container.innerHTML = ''; // مسح المحتوى القديم

        // حقول مفعلة بشكل افتراضي
        const defaultFields = ['calories', 'protein'];

        for (const key in nutritionFields) {
            const field = nutritionFields[key];
            const isChecked = defaultFields.includes(key);
            const checkboxHtml = `
                <label style="display: inline-flex; align-items: center; gap: 5px; font-size: 1em; cursor: pointer; padding: 5px 10px; border-radius: 5px; background-color: #f0f0f0;">
                    <input type="checkbox" data-field="${key}" ${isChecked ? 'checked' : ''}>
                    ${field.label}
                </label>
            `;
            container.innerHTML += checkboxHtml;
        }

        // ربط حدث التغيير لتحديث الواجهة فوراً
        container.addEventListener('change', updateUIForPlanType);
    };

    /**
     * يحتوي على جميع أكواد CSS اللازمة للسمات المختلفة وتنسيق الصفحة المحفوظة.
     */
    const getThemeStyles = () => {
        return `
            /* --- الخطوط الأساسية --- */
            body { font-family: 'Cairo', 'Tajawal', sans-serif; transition: background-color 0.3s, color 0.3s; margin: 0; padding: 20px; line-height: 1.6; }
            /* --- تصميم الحاوية الرئيسية --- */
            .container { max-width: 1200px; margin: 20px auto; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); transition: background-color 0.3s; }
            header { text-align: center; margin-bottom: 30px; }
            h1 { font-size: 2.8em; margin-bottom: 10px; }
            p.description { font-size: 1.2em; }
            /* --- تصميم الأيام والوجبات (مشترك) --- */
            #days-container { display: flex; flex-direction: column; gap: 30px; }
            .day-block { border-radius: 8px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transition: background-color 0.3s, border-color 0.3s; }
            .day-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; margin-bottom: 20px; }
            .day-header h2 { margin: 0; font-size: 2em; }
            .meals-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
            .meal-block { border-radius: 6px; padding: 15px; transition: background-color 0.3s, border-color 0.3s; }
            .meal-block [contenteditable="true"] { background-color: rgba(0,0,0,0.05); padding: 2px 4px; border-radius: 3px; }

            /* --- تصميم رأس الصفحة (البانر) --- */
            .banner-header {
                padding: 60px 20px;
                text-align: center;
                background-size: cover;
                background-position: center 30%;
                color: white;
                border-radius: 12px;
                margin-bottom: 30px;
            }
            .banner-header h1 { color: white; text-shadow: 0 2px 5px rgba(0,0,0,0.5); }
            .banner-header p.description { color: #f0f0f0; text-shadow: 0 1px 3px rgba(0,0,0,0.5); }

            .meal-block h3 { margin: 0 0 10px 0; font-size: 1.3em; padding-bottom: 8px; }
            .meal-details span { display: block; margin-top: 8px; }

            /* --- تصميم قسم اليوم القابل للطي (في الملف المحفوظ) --- */
            .day-header {
                cursor: pointer;
                position: relative;
                padding-right: 30px; /* مساحة للسهم في اليمين (RTL) */
            }
            .day-header::before {
                content: '▲';
                position: absolute;
                right: 0; /* السهم على اليمين */
                top: 50%;
                transform: translateY(-50%);
                font-size: 0.8em;
                color: var(--accent-color, #3498db);
                transition: transform 0.3s ease;
            }
            .day-block.collapsed .day-header::before {
                transform: translateY(-50%) rotate(180deg);
            }
            .day-block.collapsed .meals-container { display: none; }

            /* --- 🎨 السمات اللونية 🎨 --- */
            /* 1. السمة الافتراضية (أزرق) */
            body.default-light { --accent-color: #3498db; --accent-color-dark: #2980b9; --text-color-headings: #2c3e50; background-color: #f4f7f6; color: #333; }
            .default-light .container { background-color: #ffffff; }
            .default-light .day-block { background: #fff; border: 1px solid #e0e0e0; }
            .default-light .day-header { border-bottom: 2px solid var(--accent-color); }
            .default-light h1, .default-light .day-header h2 { color: var(--text-color-headings); }
            .default-light p.description { color: #7f8c8d; }
            .default-light .meal-block { background: #f9f9f9; border: 1px solid #ddd; }
            .default-light .meal-block h3 { color: #34495e; border-bottom: 1px solid #eee; }
            .default-light .captain-name { color: var(--accent-color); }

            /* 2. نسيم المحيط (أزرق) */
            body.ocean-blue { --accent-color: #0077b6; --accent-color-dark: #023e8a; --text-color-headings: #023e8a; background-color: #eef7ff; color: #2c3e50; }
            .ocean-blue .container { background-color: #ffffff; }
            .ocean-blue .day-header { border-bottom: 2px solid var(--accent-color); }
            .ocean-blue h1, .ocean-blue .day-header h2 { color: var(--text-color-headings); }
            .ocean-blue .meal-block { background: #f0f8ff; border: 1px solid #ade8f4; }
            .ocean-blue .meal-block h3 { color: var(--accent-color); border-bottom: 1px solid #caf0f8; }
            .ocean-blue .signature-footer { background-color: #f0f8ff; border-top-color: #ade8f4; }
            .ocean-blue .captain-name { color: var(--accent-color-dark); }

            /* 3. هدوء الغابة (أخضر) */
            body.forest-green { --accent-color: #2d6a4f; --accent-color-dark: #1b4332; --text-color-headings: #1b4332; background-color: #f0fff4; color: #1e4620; }
            .forest-green .container { background-color: #ffffff; }
            .forest-green .day-header { border-bottom: 2px solid var(--accent-color); }
            .forest-green h1, .forest-green .day-header h2 { color: var(--text-color-headings); }
            .forest-green .meal-block { background: #f6fff8; border: 1px solid #b7e4c7; }
            .forest-green .meal-block h3 { color: var(--accent-color); border-bottom: 1px solid #d8f3dc; }
            .forest-green .signature-footer { background-color: #f6fff8; border-top-color: #b7e4c7; }
            .forest-green .captain-name { color: var(--accent-color-dark); }

            /* 4. اللمسة الملكية (ذهبي) */
            body.royal-gold { --accent-color: #c5a773; --accent-color-dark: #8a6d3b; --text-color-headings: #8a6d3b; background-color: #fffaf0; color: #5d4037; }
            .royal-gold .container { background-color: #ffffff; }
            .royal-gold .day-header { border-bottom: 2px solid var(--accent-color); }
            .royal-gold h1, .royal-gold .day-header h2 { color: var(--text-color-headings); }
            .royal-gold .meal-block { background: #fffdf9; border: 1px solid #e0d2b4; }
            .royal-gold .meal-block h3 { color: var(--accent-color-dark); border-bottom: 1px solid #f5efe2; }
            .royal-gold .signature-footer { background-color: #fffdf9; border-top-color: #e0d2b4; }
            .royal-gold .captain-name { color: var(--accent-color-dark); text-shadow: 0 0 5px rgba(212, 175, 55, 0.3); }

            /* 5. الاحترافي (رمادي) */
            body.professional-gray { --accent-color: #495057; --accent-color-dark: #343a40; --text-color-headings: #343a40; background-color: #f8f9fa; color: #212529; }
            .professional-gray .container { background-color: #ffffff; }
            .professional-gray .day-header { border-bottom: 2px solid var(--accent-color); }
            .professional-gray h1, .professional-gray .day-header h2 { color: var(--text-color-headings); }
            .professional-gray .meal-block { background: #f8f9fa; border: 1px solid #dee2e6; }
            .professional-gray .meal-block h3 { color: var(--accent-color); border-bottom: 1px solid #e9ecef; }
            .professional-gray .signature-footer { background-color: #f8f9fa; border-top-color: #dee2e6; }
            .professional-gray .captain-name { color: var(--accent-color-dark); }

            /* 6. غروب الشمس (برتقالي) */
            body.sunset-orange { --accent-color: #f28c18; --accent-color-dark: #d97706; --text-color-headings: #c2410c; background-color: #fff7ed; color: #7c2d12; }
            .sunset-orange .container { background-color: #ffffff; }
            .sunset-orange .day-header { border-bottom: 2px solid var(--accent-color); }
            .sunset-orange h1, .sunset-orange .day-header h2 { color: var(--text-color-headings); }
            .sunset-orange .meal-block { background: #fffbeb; border: 1px solid #fed7aa; }
            .sunset-orange .meal-block h3 { color: var(--accent-color-dark); border-bottom: 1px solid #ffedd5; }
            .sunset-orange .signature-footer { background-color: #fffbeb; border-top-color: #fed7aa; }
            .sunset-orange .captain-name { color: var(--accent-color-dark); }

            /* 7. ملكي (بنفسجي) */
            body.royal-purple { --accent-color: #8b5cf6; --accent-color-dark: #7c3aed; --text-color-headings: #6d28d9; background-color: #f5f3ff; color: #5b21b6; }
            .royal-purple .container { background-color: #ffffff; }
            .royal-purple .day-header { border-bottom: 2px solid var(--accent-color); }
            .royal-purple h1, .royal-purple .day-header h2 { color: var(--text-color-headings); }
            .royal-purple .meal-block { background: #faf5ff; border: 1px solid #ddd6fe; }
            .royal-purple .meal-block h3 { color: var(--accent-color-dark); border-bottom: 1px solid #ede9fe; }
            .royal-purple .signature-footer { background-color: #faf5ff; border-top-color: #ddd6fe; }
            .royal-purple .captain-name { color: var(--accent-color-dark); }

            /* --- ✍️ تصميم توقيع الكابتن ✍️ --- */
            .signature-footer { margin-top: 50px; padding: 40px 20px; border-top: 2px solid #e0e0e0; text-align: center; font-family: 'Tajawal', sans-serif; background-color: #fff; }
            .signature-content .prepared-by { font-size: 1.1em; color: #888; margin: 0; }
            .signature-content .captain-name { font-size: 2.8em; font-weight: 700; margin: 5px 0; letter-spacing: 1px; color: #3498db; /* اللون الافتراضي */ }
            .signature-content .captain-title { font-size: 1.3em; color: #555; margin: 0 0 25px 0; }
            .signature-images { display: flex; justify-content: center; gap: 20px; margin-bottom: 25px; }
            .signature-images img { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid #ddd; box-shadow: 0 4px 10px rgba(0,0,0,0.1); transition: transform 0.3s, box-shadow 0.3s; }
            .signature-images img:hover { transform: scale(1.05); box-shadow: 0 6px 15px rgba(0,0,0,0.15); }
            .whatsapp-button { display: inline-flex; align-items: center; gap: 10px; background-color: #25D366; color: white; padding: 12px 25px; border-radius: 50px; text-decoration: none; font-size: 1.2em; font-weight: bold; transition: transform 0.2s, background-color 0.2s; }
            .whatsapp-button:hover { background-color: #1DAE54; transform: scale(1.05); }

            /* --- تصميم التوقيع الكلاسيكي --- */
            .classic-signature { margin-top: 40px; padding: 30px; background: linear-gradient(145deg, #2c3e50, #1f2937); color: #f9fafb; border-radius: 12px; text-align: center; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
            .classic-signature .personal-details h2 { font-size: 2.8em; margin: 0 0 10px; color: #ffffff; font-weight: 700; }
            .classic-signature .personal-details h3 { font-size: 1.6em; margin: 0 0 25px; color: #5294e2; font-weight: 400; }
            .classic-signature .image-gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 35px; }
            .classic-signature .gallery-item img { width: 100%; height: auto; border-radius: 8px; border: 4px solid #3b82f6; transition: transform 0.3s ease, box-shadow 0.3s ease; display: block; }
            .classic-signature .gallery-item img:hover { transform: scale(1.05); box-shadow: 0 0 15px rgba(59, 130, 246, 0.7); }
            .classic-signature .share-section { margin-top: 40px; text-align: center; padding: 25px; background: rgba(0,0,0,0.1); border-radius: 8px; }
            .classic-signature .share-section p { font-size: 1.1em; color: #d1d5db; margin: 0 0 15px; }

            /* --- تصميم التوقيع الحديث --- */
            .modern-signature { margin-top: 50px; padding: 0; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.08); display: flex; flex-wrap: wrap; background-color: #fff; }
            .modern-signature .modern-images { display: flex; width: 100%; }
            .modern-signature .modern-images img { width: calc(100% / 3); height: 200px; object-fit: cover; }
            .modern-signature .modern-content { padding: 30px; text-align: center; width: 100%; }
            .modern-signature .captain-name { font-size: 2.5em; font-weight: 700; margin: 0 0 5px 0; }
            .modern-signature .captain-title { font-size: 1.2em; color: #777; margin-bottom: 25px; }

            /* --- 🌙 الوضع الليلي 🌙 --- */
            body.dark-theme { background-color: #121212; color: #e0e0e0; }
            .dark-theme .container { background-color: #1e1e1e; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); }
            .dark-theme h1, .dark-theme .day-header h2 { color: #ffffff; text-shadow: 0 0 8px var(--accent-color); }
            .dark-theme p.description { color: #a0a0a0; }
            .dark-theme .day-block { background: #2a2a2a; border: 1px solid #444; }
            .dark-theme .day-header { border-bottom-color: var(--accent-color); }
            .dark-theme .meal-block { background: #333; border: 1px solid #555; }
            .dark-theme .meal-block h3 { color: #e0e0e0; border-bottom: 1px solid #555; }
            /* توقيع احترافي */
            .dark-theme .signature-footer { border-top-color: #444; background-color: #1e1e1e; }
            .dark-theme .captain-name { color: var(--accent-color); text-shadow: 0 0 10px var(--accent-color); }
            .dark-theme .captain-title, .dark-theme .prepared-by { color: #bbb; }
            /* توقيع كلاسيكي */
            .dark-theme .classic-signature { background: linear-gradient(145deg, #2a2a2a, #1a1a1a); }
            .dark-theme .classic-signature .personal-details h3 { color: var(--accent-color); }
            .dark-theme .classic-signature .gallery-item img { border-color: var(--accent-color); }
            /* توقيع حديث */
            .dark-theme .banner-header { background-blend-mode: overlay; background-color: rgba(0,0,0,0.3); }
            .dark-theme .modern-signature { background-color: #1e1e1e; border-color: #444; }
            .dark-theme .modern-signature .captain-name { color: #fff; text-shadow: 0 0 8px var(--accent-color); }
            .dark-theme .modern-signature .captain-title { color: #bbb; }

            /* --- 📱 تصميم متجاوب مع الموبايل 📱 --- */
            @media (max-width: 768px) { 
                body { padding: 10px; }
                .container { padding: 15px; }
                .banner-header { padding: 40px 15px; }
                h1, .banner-header h1 { font-size: 2em; }
                .day-header h2 { font-size: 1.5em; }
                .meal-block h3 { font-size: 1.1em; }
                .signature-images img { width: 80px; height: 80px; }
                .signature-content .captain-name { font-size: 2em; }
                .classic-signature .image-gallery { grid-template-columns: 1fr; }
                .modern-signature .modern-images { flex-direction: column; }
                .modern-signature .modern-images img { width: 100%; height: 150px; }

                /* --- Layout 1: Vertical List (Default) --- */
                .mobile-vertical .meals-container { 
                    grid-template-columns: 1fr; 
                }

                /* --- Layout 2: Compact Grid --- */
                .mobile-grid .meals-container { 
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                .mobile-grid .meal-block { padding: 10px; }
                .mobile-grid .meal-block h3 { font-size: 1em; }

                /* --- Layout 3: Simplified Cards --- */
                .mobile-cards .meals-container {
                    grid-template-columns: 1fr;
                    gap: 8px;
                }
                .mobile-cards .day-block { padding: 15px; }
                .mobile-cards .meal-block {
                    box-shadow: none;
                    border-radius: 4px;
                    border-left: 4px solid var(--accent-color, #3498db);
                }
            }
        `;
    };

    /**
     * تجلب صورة من رابط وتحولها إلى سلسلة Base64.
     * @param {string} url - رابط الصورة على الإنترنت.
     * @returns {string} - سلسلة Base64 للصورة.
     */
    const imageUrlToBase64 = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`فشل تحميل الصورة: ${url}`);
            }
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error(error);
            alert(`حدث خطأ أثناء تحميل إحدى الصور. قد لا تظهر في الملف المحفوظ.\nالخطأ: ${error.message}`);
            return url; // في حالة الفشل، يتم الرجوع إلى الرابط الأصلي
        }
    };

    /**
     * تجميع بيانات الخطة الحالية في كائن JSON.
     */
    const getPlanDataObject = () => {
        return {
            type: planTypeSelector.value,
            theme: document.getElementById('theme-selector').value,
            mode: modeToggleButton.dataset.mode,
            signature: document.getElementById('signature-layout-selector').value,
            mobile: document.getElementById('mobile-layout-selector').value,
            days: Array.from(document.querySelectorAll('.day-block')).map(dayBlock => ({
                title: dayBlock.querySelector('h2').textContent,
                meals: Array.from(dayBlock.querySelectorAll('.meal-block')).map(mealBlock => ({
                    title: mealBlock.querySelector('h3').textContent,
                    content: mealBlock.querySelector('.meal-content').textContent,
                    details: Array.from(mealBlock.querySelectorAll('.meal-details span')).map(span => ({
                        field: span.dataset.field,
                        label: span.querySelector('strong').textContent,
                        value: span.querySelector('[contenteditable]').textContent,
                        unit: span.textContent.split(' ').pop()
                    }))
                }))
            }))
        };
    };

    /**
     * حفظ البيانات في ذاكرة المتصفح (LocalStorage).
     */
    const saveToLocalStorage = () => {
        const data = getPlanDataObject();
        localStorage.setItem('muscle_factory_autosave', JSON.stringify(data));
    };

    /**
     * يحفظ البيانات يدوياً في ملف JSON.
     */
    const savePlanAsData = () => {
        const fileName = prompt("أدخل اسم ملف قاعدة البيانات:", "data-plan");
        if (!fileName || fileName.trim() === "") {
            alert("تم إلغاء الحفظ.");
            return;
        }

        const planData = getPlanDataObject();
        const blob = new Blob([JSON.stringify(planData, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName.trim()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    /**
     * بناء الواجهة من كائن البيانات.
     */
    const renderPlan = (planData) => {
        if (!planData) return;
        planTypeSelector.value = planData.type;
        document.getElementById('theme-selector').value = planData.theme;
        document.getElementById('signature-layout-selector').value = planData.signature;
        document.getElementById('mobile-layout-selector').value = planData.mobile;
        if (planData.mode === 'dark' && modeToggleButton.dataset.mode !== 'dark') toggleMode();
        else if (planData.mode === 'light' && modeToggleButton.dataset.mode === 'dark') toggleMode();
        
        daysContainer.innerHTML = '';
        dayCounter = 0;
        planData.days.forEach(dayData => {
            const dayBlock = createDayBlock();
            dayBlock.querySelector('h2').textContent = dayData.title;
            const mealsContainer = dayBlock.querySelector('.meals-container');
            dayData.meals.forEach(mealData => {
                const mealBlock = document.createElement('div');
                mealBlock.className = 'meal-block';
                let detHtml = mealData.details.map(d => `<span data-field="${d.field}"><strong>${d.label}</strong> <span contenteditable="true">${d.value}</span> ${d.unit}</span>`).join('');
                mealBlock.innerHTML = `<button class="delete-meal-btn" title="حذف الوجبة">🗑️</button><h3 contenteditable="true">${mealData.title}</h3><div class="meal-content" contenteditable="true">${mealData.content}</div><div class="meal-details">${detHtml}</div>`;
                mealsContainer.appendChild(mealBlock);
            });
            daysContainer.appendChild(dayBlock);
        });
        updateUIForPlanType();
        updateBodyClasses();
    };

    /**
     * تحميل البيانات تلقائياً.
     */
    const loadFromLocalStorage = () => {
        const saved = localStorage.getItem('muscle_factory_autosave');
        if (saved) {
            renderPlan(JSON.parse(saved));
        } else {
            // إذا لم تكن هناك بيانات، اطلب من المستخدم رفع ملف
            setTimeout(() => {
                if (confirm("مرحباً بك! هل تريد تحميل ملف بيانات موجود مسبقاً؟")) {
                    planFileInput.click();
                }
            }, 1000);
        }
    };

    /**
     * تحميل الخطة من ملف JSON المرفوع.
     */
    const loadPlanFromFile = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                renderPlan(data);
                saveToLocalStorage();
                alert("تم استيراد البيانات بنجاح.");
            } catch (error) {
                alert("خطأ في قراءة ملف JSON.");
            } finally {
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    // --- التهيئة الأولية للصفحة ---
    // قراءة نوع الخطة من الرابط إذا وجد
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    if (typeParam && (typeParam === 'diet' || typeParam === 'workout')) {
        planTypeSelector.value = typeParam;
    }

    populateNutritionFields(); // إنشاء صناديق اختيار الحقول الغذائية
    updateUIForPlanType(); // تحديث الواجهة بناءً على الاختيار الافتراضي
    loadFromLocalStorage(); // تحميل البيانات المحفوظة تلقائياً

    // ربط الأحداث بالأزرار الرئيسية
    if (addDayButton) {
        addDayButton.addEventListener('click', addDay);
    }
    if (deleteAllButton) {
        deleteAllButton.addEventListener('click', deleteAllDays);
        deleteAllButton.addEventListener('click', () => localStorage.removeItem('muscle_factory_autosave'));
    }
    if (saveButton) {
        saveButton.addEventListener('click', savePlanAsData);
    }
    if (loadPlanButton) {
        loadPlanButton.addEventListener('click', () => planFileInput.click()); // فتح نافذة اختيار الملف
    }
    if (planFileInput) {
        planFileInput.addEventListener('change', loadPlanFromFile);
    }
    if (modeToggleButton) {
        modeToggleButton.addEventListener('click', toggleMode);
    }
    if (planTypeSelector) {
        planTypeSelector.addEventListener('change', () => {
            updateUIForPlanType();
            saveToLocalStorage();
        });
    }

    // مراقبة تغييرات الإعدادات الأخرى للحفظ التلقائي
    ['theme-selector', 'signature-layout-selector', 'mobile-layout-selector'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            updateBodyClasses();
            saveToLocalStorage();
        });
    });
    modeToggleButton.addEventListener('click', () => {
        saveToLocalStorage();
    });

    /**
     * حفظ تلقائي عند أي إدخال نصوص (Typing)
     */
    daysContainer.addEventListener('input', saveToLocalStorage);

    /**
     * استخدام تفويض الأحداث للتعامل مع الأزرار الديناميكية (إضافة وجبة، حذف وجبة، حذف يوم).
     */
    if (daysContainer) {
        daysContainer.addEventListener('click', (event) => {
            const target = event.target;

            // الحالة 1: الضغط على زر "إضافة وجبة"
            if (target.classList.contains('add-meal-btn')) {
                // ابحث عن حاوية الوجبات الأقرب لهذا الزر
                const mealsContainer = target.closest('.day-block').querySelector('.meals-container');
                if (mealsContainer) {
                    mealsContainer.appendChild(createMealBlock());
                    saveToLocalStorage();
                }
            }

            // الحالة 2: الضغط على زر "حذف اليوم"
            if (target.classList.contains('delete-day-btn')) {
                const dayBlock = target.closest('.day-block');
                if (dayBlock && confirm('هل أنت متأكد من حذف هذا اليوم بالكامل؟')) {
                    dayBlock.remove();
                    saveToLocalStorage();
                    // ملاحظة: لا نعيد ترتيب أرقام الأيام الأخرى للحفاظ على البساطة
                }
            }

            // الحالة 3: الضغط على زر "حذف الوجبة"
            // يجب التأكد من أننا نضغط على الزر نفسه أو الأيقونة بداخله
            const deleteMealButton = target.closest('.delete-meal-btn');
            if (deleteMealButton) {
                const mealBlock = deleteMealButton.closest('.meal-block');
                if (mealBlock) {
                    // لا نطلب تأكيدًا لحذف وجبة واحدة لسرعة الاستخدام
                    mealBlock.remove();
                    saveToLocalStorage();
                }
            }
        });
    }
});
