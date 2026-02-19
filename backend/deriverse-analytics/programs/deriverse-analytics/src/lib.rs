use anchor_lang::prelude::*;

declare_id!("FVA1Zm6XdXVrquowDexrDuKyChmMY7oYG2Go7UEVhtz1");

const MAX_JOURNAL_LENGTH: usize = 1024;
const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub enum EntryType {
    Onchain,
    Hybrid,
    Offchain,
}

#[program]
pub mod deriverse_analytics {
    use super::*;

    pub fn add_journal(ctx: Context<AddJournal>, data: String, trade_hash: Pubkey, entry_type: EntryType) -> Result<()> {
        let journal = &mut ctx.accounts.journal;
        journal.authority = ctx.accounts.authority.key();
        journal.timestamp = Clock::get()?.unix_timestamp as u64;
        journal.trade_hash = trade_hash.key();
        journal.data = data.to_string();
        journal.entry_type = entry_type;
        Ok(())
    }

    // pub fn update_journal(ctx: Context<UpdateJournal>, data: String) -> Result<()> {
    //     let journal = &mut ctx.accounts.journal;
    //     journal.authority = ctx.accounts.authority.key();
    //     journal.timestamp = Clock::get()?.unix_timestamp as u64;
    //     journal.data = data.to_string();
    //     Ok(())
    // }
}

#[derive(Accounts)]
pub struct AddJournal<'info> {
    #[account(init, payer = authority, space = Journal::INIT_SPACE + ANCHOR_DISCRIMINATOR_SIZE, seeds = [b"journal", authority.key().as_ref(), trade_hash.key().as_ref()], bump)]
    pub journal: Account<'info, Journal>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: The trade hash is just used as a seed
    pub trade_hash: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Journal {
    pub authority: Pubkey,
    pub timestamp: u64,
    pub trade_hash: Pubkey,
    #[max_len(MAX_JOURNAL_LENGTH)]
    pub data: String,
    pub entry_type: EntryType,
}

// #[derive(Accounts)]
// pub struct UpdateJournal<'info> {
//     #[account(mut, init_if_needed, space = Journal::INIT_SPACE + ANCHOR_DISCRIMINATOR_SIZE)]
//     pub journal: Account<'info, Journal>,
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     pub system_program: Program<'info, System>,
// }
