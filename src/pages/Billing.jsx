import React from 'react'
import { snacks } from "../data/snacks";




export default function Billing() {
	return <div>{snacks.map(snack => (
  <p key={snack.id}>{snack.name} - ₹{snack.price}</p>
))}</div>
}
