document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('surveyForm');
    const steps = document.querySelectorAll('.form-step');
    const nextBtns = document.querySelectorAll('.btn-next');
    const prevBtns = document.querySelectorAll('.btn-prev');
    const progressBar = document.getElementById('progressBar');
    const stepIndicator = document.getElementById('stepIndicator');
    const surveyHeader = document.getElementById('surveyHeader');
    
    // Elements for validation
    const codeInput = document.getElementById('participationCode');
    const codeValidationMessage = document.getElementById('codeValidationMessage');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');

    let currentStep = 1;
    const totalSteps = steps.length;

    // 초기 설정
    updateProgress();

    // 코드 입력 시 자동 대문자 변환 및 공백 제거
    codeInput.addEventListener('input', function(e) {
        let value = e.target.value;
        value = value.toUpperCase().replace(/\s+/g, '');
        e.target.value = value;
        
        if (value.length > 0) {
            codeValidationMessage.classList.remove('show');
        }
    });

    // 라디오/체크박스 변경 시 에러 메시지 숨김
    const hideValidationError = (name, msgId) => {
        const inputs = document.querySelectorAll(`input[name="${name}"]`);
        const msg = document.getElementById(msgId);
        if (msg) {
            inputs.forEach(input => input.addEventListener('change', () => msg.classList.remove('show')));
        }
    };

    // 각 질문별 에러 메시지 숨김 이벤트 등록
    hideValidationError('q1', 'v-q1');
    hideValidationError('q2', 'v-q2');
    hideValidationError('q3', 'v-q3');
    hideValidationError('q4', 'v-q4');
    hideValidationError('q5', 'v-q5');
    hideValidationError('q6', 'v-q6');
    hideValidationError('q7', 'v-q7');
    hideValidationError('q8', 'v-q8');
    hideValidationError('q9', 'v-q9');
    hideValidationError('q10', 'v-q10');

    // 다음 버튼 이벤트
    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                // 특별 로직: "이직 고민이 없다"를 선택했다면 Q3(4단계) 건너뛰기
                if (currentStep === 3) {
                    const q2Value = document.querySelector('input[name="q2"]:checked').value;
                    if (q2Value === '없다') {
                        currentStep += 2; // 3단계에서 5단계로 바로 점프
                        showStep(currentStep);
                        return;
                    }
                }
                
                currentStep++;
                showStep(currentStep);
            }
        });
    });

    // 이전 버튼 이벤트
    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 특별 로직: 5단계에서 이전으로 갈 때, Q2가 '없다'였다면 4단계를 건너뛰고 3단계로 점프
            if (currentStep === 5) {
                const q2Value = document.querySelector('input[name="q2"]:checked')?.value;
                if (q2Value === '없다') {
                    currentStep -= 2;
                    showStep(currentStep);
                    return;
                }
            }

            currentStep--;
            showStep(currentStep);
        });
    });

    // 특정 스텝 표시
    function showStep(stepNum) {
        // 모든 스텝 숨기기
        steps.forEach(step => step.classList.remove('active'));
        
        // 현재 스텝 보이기
        const targetStep = document.querySelector(`.form-step[data-step="${stepNum}"]`);
        if (targetStep) {
            targetStep.classList.add('active');
        }

        // 헤더 컴팩트 모드 처리 (1단계가 아니면 헤더를 줄임)
        if (stepNum > 1) {
            surveyHeader.classList.add('compact');
        } else {
            surveyHeader.classList.remove('compact');
        }

        updateProgress();
    }

    // 진행 상황 업데이트
    function updateProgress() {
        const percent = (currentStep / totalSteps) * 100;
        progressBar.style.width = `${percent}%`;
        stepIndicator.textContent = `${currentStep} / ${totalSteps}`;
    }

    // 각 스텝별 유효성 검사
    function validateStep(stepNum) {
        let isValid = true;

        const checkRadio = (name, msgId) => {
            const checked = document.querySelector(`input[name="${name}"]:checked`);
            const msg = document.getElementById(msgId);
            if (!checked) {
                msg.classList.add('show');
                return false;
            }
            return true;
        };

        if (stepNum === 1) {
            const codeValue = codeInput.value.trim();
            if (codeValue.length < 5) {
                codeValidationMessage.classList.add('show');
                codeInput.focus();
                isValid = false;
            }
        } 
        else if (stepNum === 2) { isValid = checkRadio('q1', 'v-q1'); }
        else if (stepNum === 3) { isValid = checkRadio('q2', 'v-q2'); }
        else if (stepNum === 4) { isValid = checkRadio('q3', 'v-q3'); } // 3단계(Q2)에서 '있다'인 경우에만 오므로 무조건 검증
        else if (stepNum === 5) { isValid = checkRadio('q4', 'v-q4'); }
        else if (stepNum === 6) { isValid = checkRadio('q5', 'v-q5'); }
        else if (stepNum === 7) { isValid = checkRadio('q6', 'v-q6'); }
        else if (stepNum === 8) { isValid = checkRadio('q7', 'v-q7'); }
        else if (stepNum === 9) { isValid = checkRadio('q8', 'v-q8'); }
        else if (stepNum === 10) { isValid = checkRadio('q9', 'v-q9'); }
        else if (stepNum === 11) { isValid = checkRadio('q10', 'v-q10'); }
        else if (stepNum === 12) { 
            // 11번 질문(베스트/워스트)은 텍스트 입력이므로 강제 검증하지 않음 (선택 사항)
            isValid = true; 
        }

        return isValid;
    }

    // 폼 제출 (최종 12단계)
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // 로딩 애니메이션 시작
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // 실제 전송용 데이터 구성
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // 여기에 배포된 GAS 웹앱 URL을 입력하세요
        const SCRIPT_URL = '여기에_배포된_GAS_웹앱_URL을_입력하세요'; 
        
        if(SCRIPT_URL === '여기에_배포된_GAS_웹앱_URL을_입력하세요') {
            // URL을 아직 넣지 않았을 때는 시뮬레이션으로 동작하도록 함
            setTimeout(() => {
                submitBtn.classList.remove('loading');
                form.style.display = 'none';
                document.querySelector('.progress-wrapper').style.display = 'none';
                surveyHeader.classList.remove('compact');
                successMessage.classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 1500);
            return;
        }

        fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8' 
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            submitBtn.classList.remove('loading');
            
            if(result.status === 'success') {
                form.style.display = 'none';
                document.querySelector('.progress-wrapper').style.display = 'none';
                surveyHeader.classList.remove('compact');
                successMessage.classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // 코드 에러인 경우 1단계로 강제 이동 및 에러 표시
                alert(result.message || '유효하지 않은 코드입니다.');
                currentStep = 1;
                showStep(1);
                codeValidationMessage.textContent = result.message || '오류가 발생했습니다.';
                codeValidationMessage.classList.add('show');
                submitBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error!', error.message);
            alert('제출 중 오류가 발생했습니다. 다시 시도해 주세요.');
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        });
    });
});
