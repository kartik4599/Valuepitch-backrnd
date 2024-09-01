# ValuePitch Backend

## Installation

Use the package manager [npm](http://npmjs.com/).

```bash
git clone https://github.com/kartik4599/Valuepitch-backrnd.git
cd Valuepitch-backrnd
npm i
npm run dev
```

## Technologies

Framework: 
- Framework: [Express](https://expressjs.com/) a lightweight and flexible web framework for building Node.js applications.
- Database: [Postgresql](https://www.postgresql.org/)  a free and open-source relational database management system emphasizing extensibility and SQL compliance.
- ORM : [Prisma](https://www.prisma.io/)  a powerful ORM (Object-Relational Mapper) that simplifies data access and manipulation for various databases.
- Language : [TypeScript](https://www.typescriptlang.org/) a superset of JavaScript that adds static type safety and enhances code maintainability.
- Authorization : [JSON Web Token (JWT)](https://jwt.io/) a popular authentication standard for creating secure access tokens used for API authorization.





## API Reference

## Unprotected Route
#### login

```http
  POST /api/login

  Payload : {
    email: string;
    password: string;
  }


  Testing credentials
  email: superadmin@gmail.com
  password: superadmin@gmail.com
```

### Protected Routes

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `Authorization` | `Bearer ${token}` | **Required**. Your token |

#### Get My Data 

```http
  GET /api/me
```

#### Get Report data

```http
  GET /api/report
  Query : { type:string }
```

#### Get All Clients

```http
  GET /api/client
```

#### Get Client Detail

```http
  GET /api/client
  Parameter :{ id : string }

```

#### Create Client

```http
  POST /api/client

  Payload : {
    name: string;
    email: string;
    password: string;
    phone: string;
    address?: string;
    industryName: string;
    industryType: string;
    industrySize: string;
    site?: string;
    notes?: string;
}
```

#### Update Client

```http
  PUT /api/client

  Parameter :{ id: string }

  Payload : {
    name: string;
    email: string;
    password: string;
    phone: string;
    address?: string;
    industryName: string;
    industryType: string;
    industrySize: string;
    site?: string;
    notes?: string;
}
```

#### Delete Client

```http
  DELETE /api/client
  Parameter :{ id: string }

```

#### Get All Users

```http
  GET /api/user
```

#### Get User Detail

```http
  GET /api/user
  Parameter :{ id : string }

```

#### Create User

```http
  POST /api/user

  Payload : {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "admin" | "user";
  industryId: string;
  address?: string;
}
```

#### Update User

```http
  PUT /api/user

  Parameter :{ id: string }

  Payload : {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "admin" | "user";
  industryId: string;
  address?: string;
}
```

#### Delete User

```http
  DELETE /api/user
  Parameter :{ id: string }

```