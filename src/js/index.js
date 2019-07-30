'use strict';

const ARSCAN = "https://arscan.io/address/";

const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,           
    protocol: 'https',  
    timeout: 20000,     
    logging: false,     
})

async function getBalance(wallet) {
	const balance = await arweave.wallets.getBalance(wallet);
	return arweave.ar.winstonToAr(balance)
}

async function getAddress(jwk) {
	const address = await arweave.wallets.jwkToAddress(jwk);
	return address;
}


async function getTxsByName(name) {
	const lowName = name.toLowerCase();
	try{
    const query = {
      op: 'and',
      expr1: {
          op: 'equals',
          expr1: 'App-Name',
          expr2: 'ar-tenor'
      },
      expr2: {
          op: 'equals',
          expr1: 'Tag',
          expr2: lowName
      }     
    }
		// and tag 
    const getGifsByName = await arweave.arql(query);
    console.log(getGifsByName)
    return getGifsByName
  } catch(err){
    console.log(err)
  } 
}

async function getGifsByName(name) {
	let gifsList = [];
	try {
		var gifsData = await getTxsByName(name)
		gifsData.map(tx => gifsList.push(getGif(tx)))
		const res = await Promise.all(gifsList)
		return res
	} catch (e) {
		console.log(err)
	}
}

// all Gifs
async function getAllGifs() {
	let gifsList = [];
	try {
		var gifsData = await getGifsTxList()
		gifsData.map(tx => gifsList.push(getGif(tx)))
		const res = await Promise.all(gifsList)
		return res
	} catch (e) {
		console.log(err)
	}
}

async function getGifsByAddress(address) {
	let gifsList = [];
	try {
		var gifsData = await getTxs(address)
		gifsData.map(tx => gifsList.push(getGif(tx)))
		const res = await Promise.all(gifsList)
		return res
	} catch (e) {
		console.log(e)
	}
}

async function getGif(txId) {
	return new Promise(async (resolve,reject) => {
		try {
			const tx = await arweave.transactions.get(txId)
			const txData = JSON.parse(tx.get('data', {decode: true, string: true}))
			const from = await arweave.wallets.ownerToAddress(tx.owner)
			resolve({
				txId,
				from,
				txData
			})
		} catch	(e) {
			console.log(e)
		}
	})
}

// list of all gifs
async function fillGifsLatest() {
	$('div.listOfGifs').html('')
	let allGifsData = [];
	let html = '';
	try {
		allGifsData = await getAllGifs();
	} catch(e) {
		$('span.error').text('Error in arweave API')
		console.log('Error in arweave API')
	}

	for(let i = 0; i < allGifsData.length; i++) {
		if(allGifsData[i].txData.gif) {
			html += `<div data-id = ${i} class = 'gifPost'>`+
				`<span>Author: ${allGifsData[i].from}</span>`+
				`<img align = 'middle' src = ${allGifsData[i].txData.gif}></img>`+
				`<div class = 'tags'>#${allGifsData[i].txData.tag}`+
				`</div>`+
				`</div>`
		}
	}
	$('div.listOfGifs').html(html)
}	


async function fillGifsByAddress() {
	$('div.listOfGifs').html('')
	let allGifsData = [];
	let html = '';
	const address = sessionStorage.getItem('address')
	try {
		allGifsData = await getGifsByAddress(address);
	} catch(e) {
		console.log(e)
		$('span.error').text('Error in arweave API')
		console.log('Error in arweave API')
	}
	if(allGifsData.length < 1) {
		$('div.listOfGifs').html('<p>No Gifs</p>')
		return
	}
	for(let i = 0; i < allGifsData.length; i++) {
		if(allGifsData[i].txData.gif) {
			html += `<div data-id = ${i} class = 'gifPost'>`+
				`<span>Author: ${allGifsData[i].from}</span>`+
				`<img align = 'middle' src = ${allGifsData[i].txData.gif}></img>`+
				`<div class = 'tags'>#${allGifsData[i].txData.tag}`+
				`</div>`+
				`</div>`
		}
	}
	$('div.listOfGifs').html(html)
}	

async function getTxs(address) {
	try{
    const query = {
      op: 'and',
      expr1: {
          op: 'equals',
          expr1: 'from',
          expr2: address
      },
      expr2: {
          op: 'equals',
          expr1: 'App-Name',
          expr2: 'ar-tenor'
      }     
    }
    const getGifsByAddress = await arweave.arql(query);
    return getGifsByAddress
  } catch(err){
    console.log(err)
  }  
}


$('span.input-group-btn').on('click', async (e) => {
	e.preventDefault()
	const input = $('input#search').val();
	$('form.gifForm').hide()
	$('.gifsBlock').find('h2').text(input + " GIFs")

	let allGifsData = [];
	let html = '';
	$('div.listOfGifs').html('')
	try {
		allGifsData = await getGifsByName(input)
	} catch(e) {
		$('span.error').text('Error in arweave API')
		console.log('Error in arweave API')
	}
	for(let i = 0; i < allGifsData.length; i++) {
		if(allGifsData[i].txData.gif) {

			html += `<div data-id = ${i} class = 'gifPost'>`+
				`<span>Author: ${allGifsData[i].from}</span>`+
				`<img align = 'middle' src = ${allGifsData[i].txData.gif}></img>`+
				`<div class = 'tags'>#${allGifsData[i].txData.tag}`+
				`</div></div>`
		}
	}

	if(allGifsData.length < 1) {
		$('div.listOfGifs').append("<h5>No Results</h5>")
		return
	}
	$('div.listOfGifs').append(html)

})


async function getGifsTxList() {
	try {
		const query = {
			op: 'equals',
			expr1: 'App-Name',
			expr2: 'ar-tenor'
		}
		const listTxId = await arweave.arql(query)
		return listTxId;
	} catch(e) {
		console.log(e)
	}
}


$('input#keyfile').on('change',async (e) => {
  const reader = new FileReader()
  try {
		var wallet = await LoadWallet(e.target.files[0])

  } catch(e) {
  	console.log(e)
  }
  const walletData = JSON.parse(wallet)
  
  try {
  	var address = await getAddress(walletData)
		var balance = await getBalance(address)
		$('a.white-button').hide()
		$('a.blue-button').show()
		$('.accountData').append(`<span><a target="_blank" href = "${ARSCAN+address}">${formatAddress(address)}</a> (${Number(balance).toFixed(2)} AR)</span>`)
  	$('#loginModal').modal('toggle')
  	sessionStorage.setItem('isLogin', true);
  	sessionStorage.setItem('address', address)
  	sessionStorage.setItem('balance', balance)
  	sessionStorage.setItem('walletData', JSON.stringify(walletData))
  } catch(e) {
  	console.log(e)
  	$('span.error').text('Cannot import wallet, try another file')
  }
    
  try {
  	reader.readAsText(file)
  } catch(e) {
  	return $('span.error').text('Please choose a .json file')
  }
})


//  check if login
$(document).ready(() => {
	function isLogin() {
		const isAddress = sessionStorage.getItem('isLogin');
		if(isAddress) {
			$('a.white-button').hide()
			$('a.blue-button').show()
			let address = sessionStorage.getItem('address');
			let balance = sessionStorage.getItem('balance');
			
			if(address && balance) {
				$('.accountData').append(`<span><a target="_blank" href = "${ARSCAN+address}">${formatAddress(address)}</a> (${Number(balance).toFixed(2)} AR)</span>`)
			}
		}
	}
	isLogin()



	fillGifsLatest()
	

})

$('#gifFile').on('change',async e => {
	e.preventDefault()
	const reader = new FileReader();
	const file = document.getElementById('gifFile').files[0]
	reader.onload = img => {
    $('#filedescription').html(`<img src="${img.target.result}" width="180" height="180" />`);
  };
  reader.readAsDataURL(file);
})




$('button#uploadGif').on('click', async (e) => {
	e.preventDefault()
	const tag = $('input#tagName').val()
	const file = document.getElementById('gifFile').files[0]
	const fileUrl = await LoadImage(file)
 	
  if(!file || !fileUrl) {
  	alert("Put the gifs tag pls")
  }
  const isSucess = await postNewGif(tag, fileUrl)
  if(isSucess.success) {
  	const transactionData = isSucess.data;
  	$('#confirmModal').modal('show')
  	$('div#transactionFee').html(`<p> ${transactionData.fee} AR</p>`)
  	$('div#transactionTag').html(`<p>${transactionData.tag}</p>`)
  	$('div#transactionGif').html(`<img src=${transactionData.file} />`)
  } else {
  	alert("Error during creating TX")
  }
})

$('button#confirmUpload').on('click', async (e) => {
	e.preventDefault()
	const walletData = JSON.parse(sessionStorage.getItem('walletData'))
	
	const tag = $('input#tagName').val()
	const file = document.getElementById('gifFile').files[0]
	const fileUrl = await LoadImage(file)
	const tx = await createTx(tag, fileUrl, walletData)

	if(tx || walletData) {
		try {			
			await arweave.transactions.sign(tx.data.transaction, walletData);
		  await arweave.transactions.post(tx.data.transaction);
			$('div#confirmModal').modal('hide')
			$('input#tagName').val('')
			alert('Transaction Send, wait the confirmation to view on the permafeed')
			
		} catch(e) {
			console.log(e)
			console.log("Error during TX post")
		}
	}
})

$('a.blue-button').on('click', async (e) => {
	e.preventDefault();
	$('.gifForm').show()
	$('.gifsBlock h2').text('My Gifs:')
	fillGifsByAddress()
})

$('a.logoText').on('click', async (e) => {
	e.preventDefault();
	$('.gifForm').hide()
	$('input#search').val('')
	$('.gifsBlock h2').text('Latest GIFs')
	fillGifsLatest()
})


async function createTx(tag, file, walletData) {
	if(tag && file && walletData) {
		let transaction = {};
		const data = JSON.stringify({
			tag: tag,
			gif: file
		})
		try {
			transaction = await arweave.createTransaction({
				data: data
			}, walletData)
			transaction.addTag('App-Name', 'ar-tenor');
			transaction.addTag('Tenor','post')
			transaction.addTag('Tag', tag)
			const fee = await arweave.ar.winstonToAr(transaction.reward)
			return { 
				success: true, 
				data: {
					file,
					tag,
					fee, 
					transaction
				}
			}
		} catch(e) {
			console.log(e)
			console.log("Error during tx creation")
			return { success: false, reason: e }
		}
	}
}

async function postNewGif(tag, file) {
	const walletData = JSON.parse(sessionStorage.getItem('walletData'))
	let transaction = {}
	if(!tag || !file) return alert("Error during upload")
	const tx = await createTx(tag, file, walletData)
	return tx
}


function formatAddress(address) {
	const len = address.length;
	const shortAddress = address.substring(0, 6) + "..." + address.substring(len - 6, len);
	return shortAddress
}

async function LoadWallet(file) {
	const readAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => {
        reader.abort()
        reject()
      }
      reader.addEventListener("load", () => {resolve(reader.result)}, false)
      reader.readAsText(file)
    })
  }
  return readAsText(file);
}

async function LoadImage(file) {
	const readAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => {
        reader.abort()
        reject()
      }
      reader.addEventListener("load", () => {resolve(reader.result)}, false)
      reader.readAsDataURL(file)
    })
  }
  return readAsDataURL(file);
}