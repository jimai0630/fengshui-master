import React, { useState, useEffect } from 'react';
import PaymentModal from './PaymentModal';

type Props = {
    reportPrice: number;
    onPaymentSuccess: (paymentIntentId: string) => void;
    consultationId?: string;
    triggerOpen?: boolean; // External trigger to open modal
    onModalClose?: () => void; // Callback when modal closes
};

const PaymentSection: React.FC<Props> = ({
    reportPrice,
    onPaymentSuccess,
    consultationId,
    triggerOpen = false,
    onModalClose
}) => {
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Open modal when triggerOpen changes to true
    useEffect(() => {
        if (triggerOpen) {
            setShowPaymentModal(true);
        }
    }, [triggerOpen]);

    const handlePaymentSuccess = (paymentIntentId: string) => {
        setShowPaymentModal(false);
        onPaymentSuccess(paymentIntentId);
        onModalClose?.();
    };

    const handleClose = () => {
        setShowPaymentModal(false);
        onModalClose?.();
    };

    return (
        <PaymentModal
            isOpen={showPaymentModal}
            onClose={handleClose}
            onPaymentSuccess={handlePaymentSuccess}
            amount={reportPrice}
            consultationId={consultationId}
        />
    );
};

export default PaymentSection;
