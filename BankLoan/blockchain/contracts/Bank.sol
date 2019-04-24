pragma solidity >=0.4.21 <0.6.0;

contract Bank 
{

  struct User 
  {
    string email;
    string name;
  }

  mapping(string => User)  users;
  mapping(string => string)  userRequestStatus;
  mapping(string => uint256)  balance;

  event CreateUser( 
  string email,
  string name,
  uint256 amount);

  event updateAmount( 
  string email,
  uint256 amount);

  function createUserRequest(string memory email_, string memory name_, uint256 amount_) public 
  {
    User memory user = User( { email: email_, name: name_});
    users[email_]= user;
    balance[email_] = amount_;
    userRequestStatus[email_] = "Request send to bank";
    emit CreateUser(email_, name_, amount_);
  }

  function UpdateAmountRequest(string memory email_, uint256 amount_ ) public 
  {
    balance[email_] = amount_;
    userRequestStatus[email_] = "after updating balance request in bank";
    emit updateAmount(email_, amount_);

  }


  function getUserInfo(string memory email_ ) public  view returns(string memory email ,string memory name) 
  {
      User memory user = users[email_];
      return (user.email, user.name);
  }
  function getUserAmount(string memory email_) public  view returns(uint256 sucess) 
  {
   return( balance[email_]);

  }

}
