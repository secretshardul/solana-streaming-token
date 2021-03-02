# Solana streaming token
A streaming token inspired by superfluid. Streams are continuous flows of value. Once a stream is opened, no additional fees are required.

## [DEMO](https://solarstream.netlify.app/)

## Use cases
- Subscriptions
- Recurring payments

## Implementation
- 3 parameters (static balance, flow, timestamp) are stored in each program account. They are used to calculate the real time balance using the formula
```
REAL_TIME_BALANCE = STATIC_BALANCE + FLOW*TIME_DIFFERENCE
```
- Flows have the unit `tokens/second`.
- A stream is created between a sender and a receiver. The sender's flow value is negative and the receiver's value is positive. A stream stops when `flow=0` is passed.
- The stored static balance is updated each time the flow is changed or tokens are airdropped.
- A timer driven program is used to visualize the flow in real time.

## Tech stack
1. Frontend: React, Typescript
2. Solana program: Rust
3. Wallet and authentication: Torus

## Future scope
1. At this moment, the token supports only 2 entities- the sender and receiver. Superfluid is able to handle multiple flows simultaneously.
2. The streaming token program is independent of the SPL token program. In future, the streaming logic will be added on top of the SPL program by creating a fork. This is similar to how Solidity developers build on the ERC20 token standard.
3. Currently client-side calculations are required to find actual token balance at any given time. This operation should be performed on chain.
4. To transmit actual monetary value, SolarStream tokens will be wrappers around Sol tokens or stablecoins. SuperFluid wraps and turns DAI into streamable xDAI.

## References
- [SuperFluid](https://www.superfluid.finance/)
- [SuperFluid white paper](https://www.notion.so/Superfluid-Technical-Paper-Draft-2-8b7c5c3e212a4a40ad2e252f1609daea)
- [EIP 2100](https://github.com/ethereum/EIPs/issues/2100)
- [ERC-1620](https://github.com/ethereum/EIPs/issues/1620)
