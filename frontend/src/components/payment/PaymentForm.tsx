import React, { useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Loader } from '../ui';
import toast from 'react-hot-toast';

interface PaymentFormProps {
    clientSecret: string;
    onPaymentSuccess: (paymentIntent: any) => void;
    onPaymentError: (error: any) => void;
    isProcessing?: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
    clientSecret,
    onPaymentSuccess,
    onPaymentError,
    isProcessing: externalProcessing = false
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        if (!stripe) return;

        const clientSecretParam = new URLSearchParams(window.location.search).get(
            'payment_intent_client_secret'
        );

        if (clientSecretParam) {
            stripe.retrievePaymentIntent(clientSecretParam).then(({ paymentIntent }) => {
                switch (paymentIntent?.status) {
                    case 'succeeded':
                        setMessage('Payment succeeded!');
                        onPaymentSuccess(paymentIntent);
                        break;
                    case 'processing':
                        setMessage('Your payment is processing.');
                        break;
                    case 'requires_payment_method':
                        setMessage('Your payment was not successful, please try again.');
                        break;
                    default:
                        setMessage('Something went wrong.');
                        break;
                }
            });
        }
    }, [stripe, onPaymentSuccess]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setMessage('');

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success`,
            },
        });

        if (error) {
            if (error.type === 'card_error' || error.type === 'validation_error') {
                setMessage(error.message || 'An unexpected error occurred.');
            } else {
                setMessage('An unexpected error occurred.');
            }
            onPaymentError(error);
        }

        setIsProcessing(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement 
                options={{
                    layout: 'tabs'
                }}
            />
            
            {message && (
                <div className={`p-3 rounded-lg text-sm ${
                    message.includes('succeeded') 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                }`}>
                    {message}
                </div>
            )}

            <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={!stripe || !elements || isProcessing || externalProcessing}
                isLoading={isProcessing || externalProcessing}
            >
                {isProcessing || externalProcessing ? 'Processing...' : 'Pay Now'}
            </Button>
        </form>
    );
};

export default PaymentForm;
