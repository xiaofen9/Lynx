export interface MathInterval {
    from: {
        value: number;
        included: boolean;
    };
    to: {
        value: number;
        included: boolean;
    };
}
export default function entry(str: string): (MathInterval | null);
