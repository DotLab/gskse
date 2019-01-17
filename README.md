Gensokyo Stock Exchange (c) by Kailang Fu

Gensokyo Stock Exchange is licensed under a
Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.

You should have received a copy of the license along with this
work. If not, see <http://creativecommons.org/licenses/by-nc-sa/4.0/>.

# Gensokyo Stock Exchange
A Stock Exchange where you can trade anime characters.

Heavily inspired by [ACGN股票交易市場](https://github.com/mrbigmouth/acgn-stock) and [Investopedia](http://www.investopedia.com/simulator).

## Becoming a Friend
Anyone can become a Friend by *Signing Up* using a name and a password.
**GSKSE** currently has no restrictions on names and passwords.

New Friend will be given `$10,000` to start its venture.

Note that you cannot manually log off.

## Starting a Private Company
If you want to add your favorite character to **GSKSE**, you should *Start a Private Company* specifying a character's name and his/her description with a squre image acting as the icon for the company.
The icon *will be compressed upon upload* to 128x128px.

You need `$300` to pay for the non-refundable legal costs to start a company.
And, optionally, you can put Sunshine into the company to claim your ownership of the company.
Your ownership of the company will be diluted when other Friends start to putting Sunshine into the Company.

After start a company, you immediately become the Cheif Executive Officer of the company.
You are obligated to strive for the prosperity of the company until you are no longer the CEO of the company.

## Running the Company
As the CEO, you should post News about the company regularly to attract Clicks.

A Fiscal Year is 12 days.
At the end of each Fiscal Year, the company's profit is calculated by:
`P = G * C ^ 2 * $3,000`

P is profit.
G is number of News in this Fiscal Year about the company on the **GSKSE**. 
C is the number of Clicks in this Fiscal Year.

1. `20%` of the company's profit is collected to paid for the tax.
2. `50%` from [1] is collected by the company as the revernue. 
3. You, as the CEO, is paid 5% from [1] Sunshine as the salary.
4. The remaing Sunshine is send out to the company owers as dividend.

`20%` of your salary as CEO will be taxed while the dividend will not be taxed.

## Venture Capital
Any other Friend can go on board by investing in the company.
The Friend will own part of the company, will be able to push News about the company, and will receive dividend when a Fiscal Year is over.

The shareholders together can vote to dismiss the CEO or to appoint a Friend as the new CEO.

You may want to reinvest to keep your ownership of the company.

## Going Public
Once the company's annual revenue (per Fiscal Year) is higher than `$100,000,000`, as CEO, you can let the company go public by paying `$4,000,000` for auditing and `$1,000,000` to **GSKSE**.

You need to decide the initial stock price, how many stocks are you going to offer, and how many of that are public to start the Initial Public Offering.
These depends on the company's net worth and annual revenue. 
You might want to do some research on how to set these values.

Once the company become public traded, it can never go private again.

Now the company becomes the corporation.

1. The ownership of the company becomes the ownership of the private stocks of the corporation.
2. The private stock holders cannot sell their stocks for 1/3 of a Fiscal Year.
3. The public stocks are open for sell.
4. The Board of Directors of at maximum 7 Friends are formed for the corporation selected from the shareholders who generated the most reveneus for the company.
5. The CEO stays the same.

When all the public stocks are selled out, the IPO is over and **GSKSE** collect 8% of the Sunshine raised by selling the public stocks.

Congradulation!

## The CFO
The shareholders together can vote to dismiss the CFO or to appoint a Friend as the new CFO.

The CEO receive the same salaries as before.

The CFO receive the same salaries as the CEO.
The CFO has the power to trade stocks on the behalf of the corporation (trade stocks as the corporation).
This allows very big move in the market.

Now the corporation's profit includes the profits from trading stocks and the divident.

## Order Type
Once a company become publicly traded, Friends can freely trade stocks.
There are several type of orders available.

### Market Order
A market order is the most basic type of trade order. It instructs the broker to buy (or sell) at the best price that is currently available. Order entry interfaces usually have "buy" and "sell" buttons to make these orders quick and easy, as shown in Figure 1. Typically, this type of order will be executed immediately. The primary advantage to using a market order is that the trader is guaranteed to get the trade filled. If a trader absolutely needs to get in or out of a trade, a market order is the most reliable order type. The downside, however, is that market orders do not guarantee price, and they do not allow any precision in order entry and can lead to costly slippage. Using market orders only in markets with good liquidity can help limit losses from slippage.

Ideally, a market order to buy is filled at the ask price, and a market order to sell is filled at the bid price.
It is essential to remember, however, that the last-traded price is not automatically the price at which a market order will be executed. This is especially true in fast-moving or thinly traded markets.

Market Order to Buy (at the lowest ask price)

Market Order to Sell (at the highest bid price)

### Limit Order
A limit order is an order to buy (or sell) at a specified price or better. A buy limit order (a limit order to buy) can only be executed at the specified limit price or lower. Conversely, a sell limit order (a limit order to sell) will be executed at the specified limit price or higher. Unlike a market order where the trader can simply press "buy" and let the market "choose" the price, a trader must specify a desired price when using a limit order. While a limit orders prevents negative slippage, it does not guarantee a fill. A limit order will only be filled if price reaches the specified limit price, and a trading opportunity could be missed if price moves away from the limit price before it can be filled. Note: the market can move to the limit price and the order still may not get filled if there are not enough buyers or sellers (depending on the trade direction) at that particular price level.

Limit Order to Buy (at or below the limit price)

Limit Order to Sell (at or above the limit price)

### Stop Order
A stop order to buy or sell becomes active only after a specified price level has been reached (the "stop level"). Stop orders work in the opposite direction of limit orders: a buy stop order is placed above the market, and a sell stop order is placed below the market (see Figure 4). Once the stop level has been reached, the order is automatically converted to a market or limit order (depending on the type of order that is specified). In this sense, a stop order acts as a trigger for the market or limit order.

Consequently, stop orders are further defined as stop-market or stop-limit orders: a stop-market order sends a market order to the market once the stop level has been reached; a stop-limit order sends a limit order. Stop-market orders are perhaps the most commonly used since they are typically filled more consistently.

## Order Duration
You can further specify the duration that you want this to be active.

### Day - DAY
A day order automatically expires at the end of the regular trading session if it has not been executed. Many platforms use this as the default order duration. A "Day +" duration is valid until the end of the extended trading session.

### Good-Til-Canceled - GTC
A good-til-canceled order is active until the trade is executed or the trader cancels the order. Brokers typically cancel GTC orders automatically if they have not been filled in 30 days.

### Good-Til-Date - GTD
A GTD order remains active until a user-specified date, unless it has been filled or canceled.

### Immediate-Or-Cancel - IOC
An IOC requires all or part of the order to be executed immediately; otherwise, the order (or any unfilled parts of the order) will be canceled.

### Fill-Or-Kill - FOK
An FOK order must be filled immediately in its entirety or it will be canceled. Partial fills are not accepted with this type of order duration.

## Market Maker
To ensure the liquidity of the market, GSKSE hires specialists called Market Makers to trade stocks day and night so that you will (almost) always have something to trade.

The Market Maker will offer stocks to sell and buy if it has the Sunshine to do so.

Market Makers start action with $10,000 after the IPO. They start buy offer a price to buy higher than the current highest bid. Than, they keep a book about all the stocks that they purchased, to determain the average price of its stocks. 

They buy at the average price - spread and sell at the average price + spread. The spread is half of the average fluctuation of the stock price in the past Fiscal Year.

They try to buy and sell using all the money and stocks they have.

## Order Matching
Every 1 or more seconds, GSKSE will try to match orders together. 

1. Find the highest bid and lowest ask.
2. If the hightest bid is higher than or equal to the lowest ask, start a matching.
3. The Market Maker buy the exact trading quantity from the seller and sell to the buyer, making some Sunshine.
4. Back to Step 1.
5. Push the new Tick.
6. Adjust the Market Maker's orders based on the transaction made.
