use byteorder::{ByteOrder, LittleEndian};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    clock::Clock,
    sysvar::{Sysvar},
};
use std::mem;

entrypoint!(process_instruction);

fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    msg!("program entrypoint");

    let accounts_iter = &mut accounts.iter();

    let clock_account = next_account_info(accounts_iter)?;
    let clock = &Clock::from_account_info(clock_account)?;
    let current_time = clock.unix_timestamp;
    msg!("Current time {}", current_time);


    let sender_account = next_account_info(accounts_iter)?;

    // The account must be owned by the program in order to modify its data
    if sender_account.owner != program_id {
        msg!("account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    // The data must be large enough to hold a u64 count
    if sender_account.try_data_len()? < mem::size_of::<u32>() {
        msg!("account data length too small for u32");
        return Err(ProgramError::InvalidAccountData);
    }

    let mut sender_data = sender_account.try_borrow_mut_data()?;
    let operation = _instruction_data[0];

    let sender_balance = LittleEndian::read_u32(&sender_data[0..4]);
    // let sender_flow = LittleEndian::read_i32(&sender_data[4..8]);



    // let balance_change = sender_flow/1000; // TODO get time difference
    // let net_sender_balance = sender_balance + balance_change; // Multiply with time diff

    match operation {
        1 => {
            // TODO add flows into static balance every time
            msg!("Adding balance");
            msg!("Previous balance: {}", sender_balance);
            LittleEndian::write_u32(&mut sender_data[0..4], sender_balance + 5);
            msg!("New balance after +5: {}", sender_balance + 5);

            LittleEndian::write_i64(&mut sender_data[8..16], current_time);
        },

        2 => {
            // TODO update static balance every time this is called

            let flow = _instruction_data[1] as i32;

            let receiver_account = next_account_info(accounts_iter)?;
            let mut receiver_data = receiver_account.try_borrow_mut_data()?;

            msg!("Flowing {} sublime/second from {} to {}", flow, sender_account.key, receiver_account.key);
            LittleEndian::write_i32(&mut sender_data[4..8], -flow);
            LittleEndian::write_i32(&mut receiver_data[4..8], flow);
        },

        _ => msg!("Invalid operation")
    }
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
