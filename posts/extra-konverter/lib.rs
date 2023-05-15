//! compile with: rustc --crate-type cdylib f2b.rs -o assets/f2b.wasm --target wasm32-unknown-unknown

#[no_mangle]
pub extern "C" fn float_to_binary(num: f32) -> *const u8 {
    let binary_rep = format!("{:032b}", num.to_bits());
    binary_rep.as_ptr()
}

#[no_mangle]
pub extern "C" fn i24_to_binary(num: i32) -> *const u8 {
    let sign = if num < 0 {1} else {0};
    let abs_num = num.abs();

    let mut b_repr = String::new();

    b_repr.push_str(&sign.to_string());

    for i in (0..23).rev() {
        b_repr.push_str(&(((abs_num >> i) & 1).to_string()));
    }

    b_repr.as_ptr()
}