const addOne = (str) => {
    let result = '';
    let carry = 1;
    for (let i = str.length - 1; i >= 0; i--) {
        let digit = parseInt(str[i], 10) + carry;
        if (digit > 9) { carry = 1; digit = 0; } else { carry = 0; }
        result = digit.toString() + result;
    }
    if (carry > 0) result = carry.toString() + result;
    return result.padStart(str.length, '0');
};

console.log(addOne("20260527100050809"));
