//! compile with: gcc fptest.cpp --std=c++20 -o fptest

#include <iostream>
#include <cmath>

using std::cout;
using std::endl;

int main() {
    static_assert(sizeof(unsigned int) == sizeof(float));

    unsigned int uint_repr = 0;
    float start = *(float*)&uint_repr;

    uint_repr = 0x3f800000;
    float end = *(float*)&uint_repr;

    size_t nstep = 0;

    while(start < end) {
        start = std::nextafter(start, end);
        nstep++;
    }

    cout << "Jumlah level " << nstep << endl;

    return 0;
}