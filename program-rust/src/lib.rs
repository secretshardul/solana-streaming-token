use byteorder::{ByteOrder, LittleEndian};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use std::mem;

// Declare and export the program's entrypoint
entrypoint!(process_instruction);

// Program entrypoint's implementation
fn process_instruction(
    program_id: &Pubkey, // Public key of the account the hello world program was loaded into
    accounts: &[AccountInfo], // The account to say hello to
    _instruction_data: &[u8], // Ignored, all helloworld instructions are hellos
) -> ProgramResult {
    msg!("Helloworld Rust program entrypoint");

    // Iterating accounts is safer then indexing
    let accounts_iter = &mut accounts.iter();

    // Get the account to say hello to
    let sender_account = next_account_info(accounts_iter)?;

    // The account must be owned by the program in order to modify its data
    if sender_account.owner != program_id {
        msg!("Greeted account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    // The data must be large enough to hold a u64 count
    if sender_account.try_data_len()? < mem::size_of::<u32>() {
        msg!("Greeted account data length too small for u32");
        return Err(ProgramError::InvalidAccountData);
    }

    let mut data = sender_account.try_borrow_mut_data()?;
    let operation = _instruction_data[0];

    match operation {
        1 => {
            // TODO add flows into static balance every time
            msg!("Adding balance");

            let mut balance = LittleEndian::read_u32(&data[0..4]);
            msg!("Previous balance: {}", balance);
            balance += 5;
            LittleEndian::write_u32(&mut data[0..4], balance);
            msg!("New balance after +5: {}", balance);
        },

        2 => {
            // TODO update static balance every time this is called

            // 1 Fluid = 10^5 Sublime
            let flow = _instruction_data[1] as i32;
            msg!("Saving flow {} sublime/second", flow);
            LittleEndian::write_i32(&mut data[4..8], flow);

            let receiver_account = next_account_info(accounts_iter)?;
            msg!("Receiver account {}", receiver_account.key);
            let mut receiver_data = receiver_account.try_borrow_mut_data()?;
            LittleEndian::write_i32(&mut receiver_data[4..8], -flow);

        },

        _ => msg!("Invalid operation")
    }


    // // Increment and store the number of times the account has been greeted
    // let mut data = account.try_borrow_mut_data()?; // data stored here
    // let mut num_greets = LittleEndian::read_u32(&data);
    // num_greets += 1;
    // LittleEndian::write_u32(&mut data[0..], num_greets);

    // msg!("Hello!");

    Ok(())
}

// Sanity tests
#[cfg(test)]
mod test {
    use super::*;
    use solana_program::clock::Epoch;

    #[test]
    fn test_sanity() {
        let program_id = Pubkey::default();
        let key = Pubkey::default();
        let mut lamports = 0;
        let mut data = vec![0; mem::size_of::<u64>()];
        LittleEndian::write_u64(&mut data, 0);
        let owner = Pubkey::default();
        let account = AccountInfo::new(
            &key,
            false,
            true,
            &mut lamports,
            &mut data,
            &owner,
            false,
            Epoch::default(),
        );
        let instruction_data: Vec<u8> = Vec::new();

        let accounts = vec![account];

        // Run program and check count
        assert_eq!(LittleEndian::read_u64(&accounts[0].data.borrow()), 0);
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(LittleEndian::read_u64(&accounts[0].data.borrow()), 1);
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(LittleEndian::read_u64(&accounts[0].data.borrow()), 2);
    }
}
