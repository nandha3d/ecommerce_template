import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface PincodeData {
    Message: string;
    Status: string;
    PostOffice: {
        Name: string;
        Description: string;
        BranchType: string;
        DeliveryStatus: string;
        Circle: string;
        District: string;
        Division: string;
        Region: string;
        State: string;
        Country: string;
        Pincode: string;
    }[] | null;
}

export const useAddressLookup = (pincode: string, country: string) => {
    const [lookupData, setLookupData] = useState<{ city: string; state: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Only trigger for India (IN) and 6-digit pincode
        if (country === 'IN' && pincode.length === 6 && /^\d+$/.test(pincode)) {
            const fetchAddress = async () => {
                setIsLoading(true);
                try {
                    const response = await axios.get<PincodeData[]>(`https://api.postalpincode.in/pincode/${pincode}`);
                    const result = response.data[0];

                    if (result.Status === 'Success' && result.PostOffice && result.PostOffice.length > 0) {
                        const office = result.PostOffice[0];
                        setLookupData({
                            city: office.District,
                            state: office.State
                        });
                        toast.success(`Found: ${office.District}, ${office.State}`);
                    } else {
                        // toast.error('Invalid Pincode for India');
                    }
                } catch (error) {
                    console.error('Pincode lookup failed:', error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchAddress();
        } else {
            setLookupData(null);
        }
    }, [pincode, country]);

    return { lookupData, isLoading };
};
